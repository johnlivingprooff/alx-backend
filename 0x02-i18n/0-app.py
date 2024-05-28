#!/usr/bin/env python3
"""Basic Flask App simple route"""
from flask import Flask, render_template


app = Flask(__name__)


@app.route('/')
def hello_world():
    """Hello, World!"""
    return render_template('0-index.html')
