from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR /  "campaign_training_data.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "campaign_performance_model.joblib"

FEATURES = [
    "budget",
    "duration_days",
    "channel",
    "audience",
    "business_type",
    "goal",
]

TARGETS = ["clicks", "leads", "conversions"]

def train_model():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"CSV not found: {DATA_PATH}\n"
            "Place campaign_training_data.csv inside backend/ml/"
        )

    df = pd.read_csv(DATA_PATH)

    required_columns = FEATURES + TARGETS
    missing = [col for col in required_columns if col not in df.columns]

    if missing:
        raise ValueError(f"CSV is missing columns: {missing}")

    df = df.dropna(subset=required_columns)

    X = df[FEATURES]
    y = df[TARGETS]

    categorical_columns = [
        "channel", "audience", "business_type", "goal"
    ]

    numerical_columns = ["budget","duration_days"]

    preprocessing = ColumnTransformer([
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_columns
        ),
        ("numerical", "passthrough", numerical_columns)
    ])

    model = Pipeline([
        ('preprocessing', preprocessing),
        (
            "regressor",
            RandomForestRegressor(
                n_estimators=150,
                random_state=42,
                min_samples_leaf=3,
                n_jobs=-1
            )
        )
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    print("\nModel evaluation:")
    for index, target in enumerate(TARGETS):
        mae = mean_absolute_error(
            y_test[target],
            predictions[:, index]
        )
        r2 = r2_score(
            y_test[target],
            predictions[:, index]
        )

        print(f"{target}: MAE = {mae:.2f}, R2 = {r2:.3f}")

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print("\nTraining completed successfully.")
    print(f"CSV records used: {len(df)}")
    print(f"Saved model: {MODEL_PATH}")

if __name__ == '__main__':
    train_model()