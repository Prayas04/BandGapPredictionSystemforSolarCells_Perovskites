from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os
from matminer.featurizers.conversions import StrToComposition
from matminer.featurizers.composition import ElementProperty

app = FastAPI(
    title="Solar Band Gap Prediction API",
    description="API for predicting perovskite crystal band gaps using machine learning",
    version="1.0.0"
)

# CORS middleware to allow React frontend
# In production, allow all origins since frontend is served from same domain
# In development, allow specific localhost origins
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",") if os.getenv("CORS_ORIGINS") else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and featurizer
model = None
featurizer = None
dataset = None

# Load model and featurizer on startup
@app.on_event("startup")
async def load_model():
    global model, featurizer, dataset
    
    try:
        model_path = os.path.join(os.path.dirname(__file__), "SolarB_Gap_Pred.pkl")
        featurizer_path = os.path.join(os.path.dirname(__file__), "Features.pkl")
        dataset_path = os.path.join(os.path.dirname(__file__), "materials_info.pkl")
        
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            print(f"Model loaded from {model_path}")
        else:
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        if os.path.exists(featurizer_path):
            featurizer = joblib.load(featurizer_path)
            print(f"Featurizer loaded from {featurizer_path}")
        else:
            raise FileNotFoundError(f"Featurizer file not found: {featurizer_path}")
        
        # Load dataset (optional - app can work without it)
        try:
            if os.path.exists(dataset_path):
                dataset = pd.read_pickle(dataset_path)
                print(f"Dataset loaded from {dataset_path}")
            else:
                csv_path = os.path.join(os.path.dirname(__file__), "..", "materials_info.csv")
                if os.path.exists(csv_path):
                    dataset = pd.read_csv(csv_path)
                    print(f"Dataset loaded from {csv_path}")
                else:
                    dataset = None
                    print("Warning: Dataset file not found. Dataset endpoints will not work.")
        except Exception as dataset_error:
            print(f"Warning: Could not load dataset: {str(dataset_error)}")
            print("Dataset endpoints will not be available, but predictions will still work.")
            dataset = None
        
        print("All components loaded successfully!")
        
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        # Don't raise - allow app to start even if dataset fails
        # Only raise if model or featurizer fail
        if model is None or featurizer is None:
            raise

# Request/Response models
class PredictionRequest(BaseModel):
    formula: str

class PredictionResponse(BaseModel):
    formula: str
    predicted_band_gap: float
    is_optimal: bool
    efficiency_category: str
    confidence_range: dict

class DatasetResponse(BaseModel):
    total_records: int
    columns: list
    sample_data: list
    statistics: dict

class ModelInfoResponse(BaseModel):
    model_type: str
    features_used: int
    training_info: dict

# Root endpoint - only if frontend is not available
# This will be overridden by main.py if static files exist
@app.get("/api")
async def api_info():
    return {
        "message": "Solar Band Gap Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict",
            "dataset": "/dataset",
            "model_info": "/model_info",
            "health": "/health"
        }
    }

# Health check
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "featurizer_loaded": featurizer is not None,
        "dataset_loaded": dataset is not None
    }

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict_band_gap(request: PredictionRequest):
    if model is None or featurizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Create a dataframe with the formula
        df = pd.DataFrame({"formula": [request.formula]})
        
        # Convert string to composition
        df = StrToComposition().featurize_dataframe(df, 'formula')
        
        # Generate features
        df_featured = featurizer.featurize_dataframe(df, col_id='composition')
        
        # Drop metadata columns
        feature_cols = [col for col in df_featured.columns 
                       if col not in ['formula', 'composition']]
        X = df_featured[feature_cols]
        
        # Predict (model outputs log scale)
        log_prediction = model.predict(X)[0]
        
        # Convert back to eV and ensure it's a native Python float
        predicted_band_gap = float(np.expm1(log_prediction))
        
        # Determine if optimal for solar cells (1.1 - 1.4 eV is ideal)
        is_optimal = 1.1 <= predicted_band_gap <= 1.4
        
        # Categorize efficiency
        if predicted_band_gap < 0.1:
            efficiency_category = "Metal (Conductor)"
        elif predicted_band_gap < 1.0:
            efficiency_category = "Low Band Gap (Good for IR absorption)"
        elif predicted_band_gap <= 1.4:
            efficiency_category = "Optimal for Solar Cells"
        elif predicted_band_gap <= 2.0:
            efficiency_category = "Moderate (May work but less efficient)"
        else:
            efficiency_category = "High Band Gap (Insulator-like)"
        
        # Estimate confidence range (±0.2 eV typical RMSE)
        # Ensure all values are native Python floats
        confidence_range = {
            "lower": float(max(0, predicted_band_gap - 0.2)),
            "upper": float(predicted_band_gap + 0.2)
        }
        
        return PredictionResponse(
            formula=request.formula,
            predicted_band_gap=round(predicted_band_gap, 4),
            is_optimal=bool(is_optimal),
            efficiency_category=efficiency_category,
            confidence_range=confidence_range
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

# Dataset endpoint
@app.get("/dataset", response_model=DatasetResponse)
async def get_dataset(limit: int = 100, offset: int = 0):
    if dataset is None:
        raise HTTPException(status_code=503, detail="Dataset not loaded")
    
    try:
        # Filter semiconductors only (band_gap > 0.1)
        filtered_df = dataset[dataset['band_gap'] > 0.1].copy()
        
        # Get statistics - ensure all values are native Python types
        stats = {
            "total_materials": int(len(filtered_df)),
            "mean_band_gap": float(filtered_df['band_gap'].mean()),
            "min_band_gap": float(filtered_df['band_gap'].min()),
            "max_band_gap": float(filtered_df['band_gap'].max()),
            "std_band_gap": float(filtered_df['band_gap'].std()),
            "optimal_count": int(len(filtered_df[(filtered_df['band_gap'] >= 1.1) & 
                                                (filtered_df['band_gap'] <= 1.4)]))
        }
        
        # Get sample data
        sample_df = filtered_df.iloc[offset:offset+limit]
        
        # Convert to dict format and ensure all values are native Python types
        sample_data = []
        for _, row in sample_df[['material_id', 'formula', 'band_gap']].iterrows():
            sample_data.append({
                'material_id': str(row['material_id']) if pd.notna(row['material_id']) else None,
                'formula': str(row['formula']) if pd.notna(row['formula']) else None,
                'band_gap': float(row['band_gap']) if pd.notna(row['band_gap']) else None
            })
        
        return DatasetResponse(
            total_records=int(len(filtered_df)),
            columns=[str(col) for col in filtered_df.columns],
            sample_data=sample_data,
            statistics=stats
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset error: {str(e)}")

# Model info endpoint
@app.get("/model_info", response_model=ModelInfoResponse)
async def get_model_info():
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        model_type = type(model).__name__
        
        # Get number of features - ensure it's a native Python type
        if hasattr(model, 'n_features_in_'):
            n_features = int(model.n_features_in_)
        else:
            n_features = "Unknown"
        
        # Get model parameters if available
        training_info = {
            "algorithm": "XGBoost Regressor",
            "objective": "reg:squarederror",
            "features_count": n_features,
            "target_metric": "RMSE < 0.7 eV",
            "optimization": "Grid Search with 3-Fold CV",
            "target_transform": "log1p transformation"
        }
        
        if hasattr(model, 'get_params'):
            # Convert hyperparameters to native Python types
            params = model.get_params()
            training_info["hyperparameters"] = {
                k: (int(v) if isinstance(v, (np.integer, np.int64)) else 
                    float(v) if isinstance(v, (np.floating, np.float64)) else 
                    bool(v) if isinstance(v, np.bool_) else v)
                for k, v in params.items()
            }
        
        return ModelInfoResponse(
            model_type=model_type,
            features_used=n_features,
            training_info=training_info
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model info error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable (Render provides this), default to 8000 for local
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

