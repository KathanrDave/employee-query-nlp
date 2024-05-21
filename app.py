from flask import Flask, request, jsonify
import spacy
from datetime import datetime, date, timedelta
import re

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")  
# Function to adjust time by -5.5 hours
def adjust_time_by_offset(time_str, fmt="%I %p", offset_hours=-5, offset_minutes=-30):
    time_obj = datetime.strptime(time_str, fmt)
    offset = timedelta(hours=offset_hours, minutes=offset_minutes)
    adjusted_time = time_obj + offset
    return adjusted_time.strftime("%H:%M:%S")


def parse_query(natural_query):
    doc = nlp(natural_query)
    date_entity = None
    time_conditions = []
    entities = {}

    for ent in doc.ents:
        if ent.label_ == "TIME":
            time_conditions.append(ent.text)
        elif ent.label_ == "DATE":
            date_entity = ent.text
        elif ent.label_ in ["PERSON", "ORG", "GPE"]:
            entities[ent.label_] = ent.text

    sql_query = 'SELECT * FROM "Employee"'  # Default base query
    conditions = []

        # Default to today's date
    query_date = date.today().strftime('%Y-%m-%d')
    if date_entity:
        try:
            query_date = datetime.strptime(date_entity, "%B %d, %Y").strftime('%Y-%m-%d')
        except ValueError:
            pass  # If date parsing fails, stick with today's date

    # Common time patterns
    time_pattern = r'(\d{1,2} (?:AM|PM))'
    time_matches = re.findall(time_pattern, natural_query)

    # Handling different query types
    if "employees" in natural_query:
        if "checked in before" in natural_query:
            if time_matches:
                time_24hr = adjust_time_by_offset(time_matches[0])
                conditions.append(f"\"check_in\"::date = '{query_date}' AND \"check_in\"::time < '{time_24hr}'")
        if "checked in after" in natural_query:
            if time_matches:
                time_24hr = adjust_time_by_offset(time_matches[0])
                conditions.append(f"\"check_in\"::date = '{query_date}' AND \"check_in\"::time > '{time_24hr}'")
        if "checked out before" in natural_query:
            if time_matches:
                time_24hr = adjust_time_by_offset(time_matches[0])
                conditions.append(f"\"check_out\"::date = '{query_date}' AND \"check_out\"::time < '{time_24hr}'")
        if "checked out after" in natural_query:
            if time_matches:
                time_24hr = adjust_time_by_offset(time_matches[0])
                conditions.append(f"\"check_out\"::date = '{query_date}' AND \"check_out\"::time > '{time_24hr}'")
        if "how many employees" in natural_query:
            sql_query = 'SELECT COUNT(*) FROM "Employee"'
    elif "average check-in time" in natural_query:
        sql_query = 'SELECT AVG("check_in") FROM "Employee"'
    elif "ordered by their check-out times" in natural_query:
        sql_query += ' ORDER BY "check_out"'
    elif "online between" in natural_query:
        if len(time_matches) == 2:
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
        sql_query, success = parse_query(natural_query)
        if not success:
            return jsonify({"error": sql_query}), 400
        return jsonify({"sql": sql_query})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
