#!/usr/bin/env python3
"""Basic Flask App simple route"""
from flask import Flask, render_template, request
from flask_babel import Babel, gettext


app = Flask(__name__)
babel = Babel(app)


class Config:
    """Config class"""
    LANGUAGES = ["en", "fr"]
    BABEL_DEFAULT_LOCALE = "en"
    BABEL_DEFAULT_TIMEZONE = "UTC"


app.config.from_object(Config)


@babel.localeselector
def get_locale():
    """Get forced locale"""
    locale = request.args.get('locale')
    if locale in app.config['LANGUAGES']:
        return locale
    return request.accept_languages.best_match(app.config['LANGUAGES'])


@app.route('/')
def root_url():
    """Hello, World!"""
    return render_template('4-index.html',
                           home_title=gettext('home_title'),
                           home_header=gettext('home_header'))


if __name__ == "__main__":
    app.run()
