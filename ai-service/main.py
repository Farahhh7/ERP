from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from aggregation import (
    get_stock_movements_for_product,
    get_all_products,
    save_forecast,
    get_db
)
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

def calculate_mape(actual, predicted):
    """MAPE < 15% = modèle fiable"""
    actual = np.array(actual)
    predicted = np.array(predicted)
    mask = actual != 0
    if not mask.any():
        return 0
    return float(np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100)

def generate_simple_forecast(df, days):
    """
    Forecast simple b moving average ki ma3andnach
    assez de data lel Prophet
    """
    if len(df) == 0:
        return 0
    avg = df['y'].mean()
    return round(avg * days / 7, 2)

def prophet_forecast(df):
    """
    Prophet forecast — yarja3 j7, j30, j90 w mape
    """
    try:
        from prophet import Prophet

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05
        )
        model.fit(df)

        # Predict j7
        future_7 = model.make_future_dataframe(periods=7)
        forecast_7 = model.predict(future_7)
        j7 = max(0, forecast_7['yhat'].tail(7).sum())

        # Predict j30
        future_30 = model.make_future_dataframe(periods=30)
        forecast_30 = model.predict(future_30)
        j30 = max(0, forecast_30['yhat'].tail(30).sum())

        # Predict j90
        future_90 = model.make_future_dataframe(periods=90)
        forecast_90 = model.predict(future_90)
        j90 = max(0, forecast_90['yhat'].tail(90).sum())

        # Calculate MAPE sur el historical data
        historical_forecast = forecast_7[forecast_7['ds'].isin(df['ds'])]
        if len(historical_forecast) > 0:
            mape = calculate_mape(
                df['y'].values[-len(historical_forecast):],
                historical_forecast['yhat'].values
            )
        else:
            mape = 0

        return {
            'j7': round(j7, 2),
            'j30': round(j30, 2),
            'j90': round(j90, 2),
            'mape': round(mape, 2),
            'model': 'prophet'
        }

    except Exception as e:
        print(f'Prophet error: {e}')
        # Fallback: moving average
        j7 = generate_simple_forecast(df, 7)
        j30 = generate_simple_forecast(df, 30)
        j90 = generate_simple_forecast(df, 90)
        return {
            'j7': j7,
            'j30': j30,
            'j90': j90,
            'mape': 0,
            'model': 'moving_average'
        }

# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'PSM AI Service en marche 🤖', 'status': 'ok'})

@app.route('/forecast/<product_id>', methods=['GET'])
def forecast_product(product_id):
    """
    Forecast lel produit wa7ed — yarja3 j7/j30/j90/mape
    """
    try:
        df = get_stock_movements_for_product(product_id)

        if df is None or len(df) < 2:
            # Ma3andnach assez de data — rja3 demo data
            return jsonify({
                'product_id': product_id,
                'j7': 15,
                'j30': 60,
                'j90': 180,
                'mape': 0,
                'model': 'demo',
                'message': 'Données insuffisantes — données de démonstration'
            })

        result = prophet_forecast(df)

        # Sauvegarde fel MongoDB
        save_forecast(
            product_id,
            result['j7'],
            result['j30'],
            result['j90'],
            result['mape']
        )

        return jsonify({
            'product_id': product_id,
            **result
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forecast/all', methods=['POST'])
def forecast_all():
    """
    Lance el forecast lel kol el produits
    """
    try:
        products = get_all_products()
        results = []

        for product in products:
            product_id = str(product['_id'])
            try:
                df = get_stock_movements_for_product(product_id)

                if df is None or len(df) < 2:
                    result = {
                        'product_id': product_id,
                        'nom': product.get('nom', ''),
                        'sku': product.get('sku', ''),
                        'j7': 15, 'j30': 60, 'j90': 180,
                        'mape': 0, 'model': 'demo'
                    }
                else:
                    forecast = prophet_forecast(df)
                    save_forecast(
                        product_id,
                        forecast['j7'],
                        forecast['j30'],
                        forecast['j90'],
                        forecast['mape']
                    )
                    result = {
                        'product_id': product_id,
                        'nom': product.get('nom', ''),
                        'sku': product.get('sku', ''),
                        **forecast
                    }

                results.append(result)

            except Exception as e:
                results.append({
                    'product_id': product_id,
                    'error': str(e)
                })

        return jsonify({
            'total': len(results),
            'results': results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """
    Health check — backend Node.js yesta3melha
    bech ya3raf ken el AI service shaghal
    """
    try:
        db = get_db()
        db.command('ping')
        return jsonify({
            'status': 'healthy',
            'mongodb': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print(f'PSM AI Service yetstart 3al port {port} 🤖')
    app.run(host='0.0.0.0', port=port, debug=True)