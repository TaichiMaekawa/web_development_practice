from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "<h1>fuck</h1> <p>you</p>"

if __name__ == '__main__':
    app.run(debug=True)
