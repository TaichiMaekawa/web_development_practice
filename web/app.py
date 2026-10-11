from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "<h1>Hello, Taichi!</h1><p>Webアプリ開発の第一歩です。</p>"

if __name__ == '__main__':
    app.run(debug=True)
