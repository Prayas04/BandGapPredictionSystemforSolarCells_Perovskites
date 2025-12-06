import pandas as pd
import numpy as np
from matminer.featurizers.conversions import StrToComposition
from matminer.featurizers.composition import ElementProperty
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score
import joblib
from multiprocessing import freeze_support

def main():
    # --- 1. Data Loading & Cleaning ---
    print("1. Loading data...")
    try:
        df = pd.read_pickle("materials_info.pkl")
    except:
        df = pd.read_csv("materials_info.csv")

    print(f"   Original dataset size: {len(df)}")

    # OPTIMIZATION #1: Remove Metals
    # We only care about semiconductors for solar cells. 
    # Removing 0-gap metals reduces noise significantly.
    df = df[df['band_gap'] > 0.1]
    print(f"   Filtered dataset size (Semiconductors): {len(df)}")

    # --- 2. Featurization (Turning Chemistry into Math) ---
    print("2. Generating Chemical Features...")
    df = StrToComposition().featurize_dataframe(df, 'formula')
    
    # Using Magpie preset (Mass, Electronegativity, Radii, Valence, etc.)
    ep_feat = ElementProperty.from_preset(preset_name='magpie')
    df = ep_feat.featurize_dataframe(df, col_id='composition')
    print("   Features generated.")

    # --- 3. Prepare Training Data ---
    # Drop metadata and targets
    X = df.drop(columns=['material_id', 'formula', 'structure', 'composition', 'band_gap'])
    y = df['band_gap']

    # OPTIMIZATION #2: Log-Transform the Target
    # We predict log(band_gap) instead of raw band_gap.
    # This prevents high band gaps (e.g., 8.0 eV) from skewing the model,
    # and focuses attention on the small differences in the 1.0 - 2.0 eV range.
    y_log = np.log1p(y) 

    X_train, X_test, y_log_train, y_log_test = train_test_split(X, y_log, test_size=0.2, random_state=42)

    # --- 4. Hyperparameter Tuning (Grid Search) ---
    print("3. Starting Grid Search (Optimizing Model)...")
    print("   (This may take 1-2 minutes depending on your CPU)")

    # Define the "Search Space"
    param_grid = {
        'n_estimators': [200, 500],        # Try 200 and 500 trees
        'learning_rate': [0.01, 0.05],     # Slower learning is usually more accurate
        'max_depth': [3, 5],               # Depth of chemical rules
        'subsample': [0.8],                # Prevent overfitting
        'colsample_bytree': [0.8]          # Prevent overfitting
    }

    xgb = XGBRegressor(objective='reg:squarederror', n_jobs=-1)

    # OPTIMIZATION #3: Grid Search
    # Find the best combination of parameters automatically
    grid_search = GridSearchCV(
        estimator=xgb,
        param_grid=param_grid,
        cv=3, # 3-Fold Cross Validation
        scoring='neg_root_mean_squared_error',
        verbose=1
    )

    grid_search.fit(X_train, y_log_train)

    best_model = grid_search.best_estimator_
    print(f"   Best Params found: {grid_search.best_params_}")

    # --- 5. Evaluation ---
    print("4. Evaluating...")
    
    # Predict (Output is in Log scale)
    log_preds = best_model.predict(X_test)
    
    # Inverse Transform (Convert back to eV)
    # expm1 is the inverse of log1p
    final_preds = np.expm1(log_preds)
    y_test_original = np.expm1(y_log_test)

    # Metrics
    mse = mean_squared_error(y_test_original, final_preds)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test_original, final_preds)

    print("-" * 40)
    print(f"Model RMSE: {rmse:.4f} eV (Target: < 0.7)")
    print(f"Model R2 Score: {r2:.4f}")
    print("-" * 40)

    # --- 6. Save Artifacts ---
    # Save the BEST model found by grid search
    joblib.dump(best_model, "SolarB_Gap_Pred.pkl")
    joblib.dump(ep_feat, "Features.pkl")
    print("Saved optimized model and featurizer.")

if __name__ == '__main__':
    freeze_support()
    main()