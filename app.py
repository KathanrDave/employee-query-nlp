from flask import Flask, request, jsonify
import spacy
from datetime import datetime, date, timedelta
import re
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Load the Spacy model
try:
    nlp = spacy.load("en_core_web_sm")
    logging.info("Spacy model loaded successfully.")
except Exception as e:
    nlp = None
    logging.error(f"Error loading Spacy model: {e}")

# Function to adjust time by -5.5 hours
def adjust_time_by_offset(time_str, fmt="%I %p", offset_hours=-5, offset_minutes=-30):
    try:
        time_obj = datetime.strptime(time_str, fmt)
        offset = timedelta(hours=offset_hours, minutes=offset_minutes)
        adjusted_time = time_obj + offset
        return adjusted_time.strftime("%H:%M:%S")
    except Exception as e:
        logging.error(f"Error adjusting time: {e}")
        raise

def parse_query(natural_query):
    if not nlp:
        logging.error("Spacy model is not loaded.")
        return "Spacy model is not loaded.", False

    logging.debug(f"Parsing query: {natural_query}")
    try:
        doc = nlp(natural_query)
    except Exception as e:
        logging.error(f"Error parsing query with Spacy: {e}")
        return "Error parsing query with Spacy", False

    date_entity = None
    time_conditions = []
    entities = {}

    for ent in doc.ents:
        logging.debug(f"Entity found: {ent.text} with label {ent.label_}")
        if ent.label_ == "TIME":
            time_conditions.append(ent.text)
        elif ent.label_ == "DATE":
            date_entity = ent.text
        elif ent.label_ in ["PERSON", "ORG", "GPE"]:
            entities[ent.label_] = ent.text

    sql_query = 'SELECT * FROM "Employee"'
    conditions = []

    query_date = date.today().strftime('%Y-%m-%d')
    if date_entity:
        try:
            query_date = datetime.strptime(date_entity, "%B %d, %Y").strftime('%Y-%m-%d')
        except ValueError:
            logging.warning(f"Error parsing date: {date_entity}")

    time_pattern = r'(\d{1,2} (?:AM|PM))'
    time_matches = re.findall(time_pattern, natural_query)

    if "employees" in natural_query:
        if "checked in before" in natural_query and time_matches:
            time_24hr = adjust_time_by_offset(time_matches[0])
            conditions.append(f"\"check_in\"::date = '{query_date}' AND \"check_in\"::time < '{time_24hr}'")
        if "checked in after" in natural_query and time_matches:
            time_24hr = adjust_time_by_offset(time_matches[0])
            conditions.append(f"\"check_in\"::date = '{query_date}' AND \"check_in\"::time > '{time_24hr}'")
        if "checked out before" in natural_query and time_matches:
            time_24hr = adjust_time_by_offset(time_matches[0])
            conditions.append(f"\"check_out\"::date = '{query_date}' AND \"check_out\"::time < '{time_24hr}'")
        if "checked out after" in natural_query and time_matches:
            time_24hr = adjust_time_by_offset(time_matches[0])
            conditions.append(f"\"check_out\"::date = '{query_date}' AND \"check_out\"::time > '{time_24hr}'")
        if "how many employees" in natural_query:
            sql_query = 'SELECT COUNT(*) FROM "Employee"'
    elif "average check-in time" in natural_query:
        sql_query = 'SELECT AVG("check_in") FROM "Employee"'
    elif "ordered by their check-out times" in natural_query:
        sql_query += ' ORDER BY "check_out"'
    elif "online between" in natural_query and len(time_matches) == 2:
        time_start = adjust_time_by_offset(time_matches[0])
        time_end = adjust_time_by_offset(time_matches[1])
        conditions.append(f"\"check_in\"::date = '{query_date}' AND \"check_in\"::time <= '{time_start}' AND \"check_out\"::time >= '{time_end}'")
        
    if conditions:
        sql_query += " WHERE " + " AND ".join(conditions)

    return sql_query, True

@app.route('/translate', methods=['POST'])
def translate_query():
    try:
        data = request.json
        natural_query = data.get('query', '')
        logging.debug(f"Received query: {natural_query}")
        sql_query, success = parse_query(natural_query)
        if not success:
            return jsonify({"error": sql_query}), 400
        return jsonify({"sql": sql_query})
    except Exception as e:
        logging.exception("Error in translate_query:")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
