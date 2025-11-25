# server/ml_ai/predict.py
import sys
import re
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

label_map = {
    0: "Tiêu (tiêu cực mạnh)",
    1: "Không tiêu (không xấu)",
    2: "Không tích (không tốt)",
    3: "Tích (tích cực mạnh)"
}

def clean_text(t: str) -> str:
    t = t.lower()
    t = re.sub(r"[^a-zA-ZÀ-ỹ\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

# --- load model có log lỗi rõ ràng ---
def load_model():
    try:
        import joblib
    except Exception as e:
        print(f"ERROR_IMPORT_JOBLIB: {e}", file=sys.stderr)
        raise

    try:
        model = joblib.load(os.path.join(BASE_DIR, "sentiment4_model.pkl"))
        vectorizer = joblib.load(os.path.join(BASE_DIR, "sentiment4_vectorizer.pkl"))
        return model, vectorizer
    except Exception as e:
        print(f"ERROR_LOADING_MODEL: {e}", file=sys.stderr)
        raise

def predict(text: str) -> str:
    model, vectorizer = load_model()
    c = clean_text(text)
    vec = vectorizer.transform([c])
    lbl = model.predict(vec)[0]
    return label_map.get(lbl, "Không xác định")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Chưa có text")
    else:
        text = sys.argv[1]
        try:
            result = predict(text)
            print(result)
        except Exception as e:
            # để chắc chắn luôn có cái gì đó in ra
            print(f"ERROR_PREDICT: {e}", file=sys.stderr)
            sys.exit(1)
