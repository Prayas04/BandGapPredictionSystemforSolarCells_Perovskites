# Solar Band Gap Prediction System

A professional-grade web application for predicting perovskite crystal band gaps using machine learning. Built with FastAPI backend and React frontend.

## Project Overview

This system predicts the Band Gap (E_g) of Perovskite crystals, which is crucial for determining solar cell efficiency. The "Band Gap" determines if a material is a conductor, insulator, or semiconductor. For a solar cell to be efficient, it needs a "Goldilocks" band gap (ideally between 1.1 eV and 1.4 eV).

## Features

- **Home Page**: Overview of the system and key concepts
- **Dataset**: Browse and explore the materials dataset used for training
- **About**: Comprehensive theoretical concepts about band gaps and solar cells
- **Predictions**: Interactive band gap prediction with detailed analysis and visualization

## Tech Stack

### Backend
- FastAPI - Modern Python web framework
- XGBoost - Machine learning model
- Matminer - Material science featurization
- Pandas/NumPy - Data processing

### Frontend
- React 18 - UI framework
- React Router - Navigation
- Recharts - Data visualization
- Vite - Build tool

## Project Structure

```
SolarBandGapPrediction/
├── Backend/
│   ├── app.py              # FastAPI application
│   ├── Train.py            # Model training script
│   ├── SolarB_Gap_Pred.pkl # Trained model
│   ├── Features.pkl        # Featurizer
│   ├── materials_info.pkl  # Dataset
│   └── requirements.txt    # Python dependencies
├── Fend/
│   ├── src/
│   │   ├── pages/          # React page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json         # Node dependencies
│   └── vite.config.js      # Vite configuration
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Create a virtual environment (if not already created):
```bash
python -m venv S_Env
```

3. Activate the virtual environment:
- Windows:
```bash
S_Env\Scripts\activate
```
- Linux/Mac:
```bash
source S_Env/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Ensure model files exist:
   - `SolarB_Gap_Pred.pkl` - Trained model
   - `Features.pkl` - Featurizer
   - `materials_info.pkl` or `materials_info.csv` - Dataset

   If model files don't exist, run the training script:
```bash
python Train.py
```

### Frontend Setup

1. Navigate to the Fend directory:
```bash
cd Fend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Start Backend Server

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Activate virtual environment (if not already active)

3. Run the FastAPI server:
```bash
python app.py
```

Or using uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Start Frontend Development Server

1. Navigate to Fend directory:
```bash
cd Fend
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /predict` - Predict band gap for a chemical formula
- `GET /dataset` - Get dataset information and samples
- `GET /model_info` - Get model information

### Example API Usage

```python
import requests

# Predict band gap
response = requests.post('http://localhost:8000/predict', json={
    'formula': 'CsPbI3'
})
print(response.json())
```

## Usage Guide

1. **Home Page**: Start here to understand the system overview
2. **Dataset**: Browse materials in the training dataset with pagination
3. **About**: Learn about band gaps, perovskites, and ML approach
4. **Predictions**: 
   - Enter a chemical formula (e.g., `CsPbI3`, `CH3NH3PbBr3`)
   - Click "Predict Band Gap"
   - View detailed analysis including:
     - Predicted band gap value
     - Efficiency category
     - Optimal range visualization
     - Confidence intervals

## Model Details

- **Algorithm**: XGBoost Regressor
- **Features**: Magpie feature set (132 features)
- **Target**: log(band_gap + 1) transformation
- **Optimization**: Grid Search with 3-Fold Cross Validation
- **Target RMSE**: < 0.7 eV

## Development

### Backend Development
- API documentation available at `http://localhost:8000/docs` (Swagger UI)
- Alternative docs at `http://localhost:8000/redoc`

### Frontend Development
- Hot module replacement enabled
- Proxy configured for API calls

## Notes

- The model filters out metals (band_gap < 0.1 eV) as they're not suitable for solar cells
- Optimal band gap range for solar cells: 1.1 - 1.4 eV
- Predictions include confidence intervals (±0.2 eV typical)

## License

This project is for academic/research purposes.

