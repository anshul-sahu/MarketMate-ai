# MarketMate AI — AI Marketing Campaign Copilot

MarketMate AI is an AI-powered marketing campaign assistant that helps businesses and marketers plan campaigns, generate marketing content, allocate advertising budgets, and estimate campaign performance using Machine Learning.

The application combines Generative AI, Agentic AI, and Machine Learning to simplify marketing campaign planning and support data-driven decisions.

## 🚀 Features

### 🤖 AI Marketing Campaign Generation
- Generate marketing campaign strategies based on business requirements.
- Create advertising copy for Google Ads and Meta Ads.
- Generate campaign ideas based on target audience and marketing objectives.
- Create content calendars for marketing campaigns.
- Recommend suitable marketing channels.

### 🧠 Agentic AI
- Uses a Gemini-powered AI agent with LangChain.
- Integrates custom tools for budget allocation, content calendar generation, and marketing channel recommendations.
- Combines user inputs with tool-based processing to generate campaign suggestions.

### 📊 Campaign Performance Prediction
- Uses a Random Forest Regression model to estimate campaign performance.
- Predicts expected clicks, leads, and conversions.
- Estimates cost per lead based on the advertising budget and predicted leads.
- Considers advertising budget, campaign duration, advertising channel, target audience, business type, and campaign objective.

**Note:** The current regression model uses synthetic demonstration data. Predictions are intended for development and demonstration purposes and are not validated real-world advertising forecasts.

### 💰 Advertising Budget Allocation
- Suggests budget distribution across advertising channels.
- Helps organize campaign spending based on marketing objectives.

### 📅 Content Calendar Generation
- Generates content schedules according to campaign duration.
- Suggests content types and marketing activities for different campaign days.

### 💾 Campaign Management
- Stores campaign information using SQLite.
- Allows users to retrieve previously saved campaigns.
- Keeps campaign planning and AI-generated results organized.

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3
- Bootstrap 5
- Vite

**Backend**
- Python
- Flask
- Flask-CORS
- REST APIs

**Artificial Intelligence and Machine Learning**
- Google Gemini API
- LangChain
- Agentic AI and tool calling
- Scikit-learn
- Random Forest Regressor
- Pandas
- NumPy
- Joblib

**Database**
- SQLite

**Development Tools**
- Git
- GitHub
- Postman
- VS Code

## 🏗️ Project Architecture

```text
MarketMate-AI/
│
├── backend/
│   ├── app.py
│   ├── agent.py
│   ├── tools.py
│   ├── database.py
│   ├── requirements.txt
│   └── ml/
│       ├── __init__.py
│       ├── train_regression.py
│       ├── predictor.py
│       ├── campaign_training_data.csv
│       └── models/
│           └── campaign_performance_model.joblib
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── CampaignPredictor.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the application:

- Python 3.10 or later, compatible with the selected dependencies
- Node.js and npm
- Git
- A Google Gemini API key

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd marketmate-ai
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Set Up the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment.

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
```

Replace the placeholder values with your actual API key and a Gemini model currently supported by your API account.

**Security:** Never commit your `.env` file or expose your API key publicly.

### 4. Train the Machine Learning Model

Ensure that `campaign_training_data.csv` is present inside `backend/ml/`.

Run the training script from the backend directory:

```bash
python -m ml.train_regression
```

This trains the Random Forest Regression model, evaluates it on a held-out test split, and saves the trained model inside:

```text
backend/ml/models/campaign_performance_model.joblib
```

The CSV currently contains synthetic demonstration data. For reliable real-world forecasting, replace it with suitable historical campaign data and evaluate the model on representative real campaigns.

### 5. Start the Backend Server

From the backend directory, run:

```bash
python app.py
```

The Flask API runs at:

```text
http://127.0.0.1:5000
```

### 6. Set Up the Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal by Vite.

## 🧠 Machine Learning Workflow

The campaign performance prediction pipeline follows these steps:

1. Load campaign data from the CSV file.
2. Separate input features from prediction targets.
3. Encode categorical features using One-Hot Encoding.
4. Split the dataset into training and testing subsets.
5. Train a Random Forest Regression model.
6. Evaluate model performance using Mean Absolute Error (MAE) and R².
7. Save the trained model using Joblib.
8. Load the model in Flask to generate predictions from user inputs.
9. Calculate estimated cost per lead using the predicted lead count.

**Input features**
- Advertising budget
- Campaign duration
- Advertising channel
- Target audience
- Business type
- Campaign objective

**Prediction targets**
- Expected clicks
- Expected leads
- Expected conversions



## 🔮 Future Enhancements

- Train models using real historical advertising campaign data.
- Add classification models for lead conversion prediction.
- Implement customer segmentation using K-Means clustering.
- Compare budget allocations across multiple advertising channels.
- Visualize campaign performance with interactive charts.
- Integrate prediction explanations and optimization suggestions through the Gemini agent.
- Add campaign export functionality.
- Deploy the application to a cloud platform.

## 🎯 Project Objectives

MarketMate AI demonstrates the practical integration of:

- Full-stack web development with React and Flask.
- REST API development and database integration.
- Generative AI using a hosted large language model.
- Agentic AI through tool calling.
- Machine Learning using regression algorithms.
- Data preprocessing, model evaluation, and model serialization.
- AI-assisted marketing workflow automation.


## 📄 License

This project is intended for educational and demonstration purposes. Add an appropriate open-source license file if you intend to distribute or reuse the project under a specific license.
