#!/usr/bin/env python3
"""Pagination helper"""


def index_range(page, page_size):
    """returns a tuple with start & end index"""
    start = (page - 1) * page_size
    end = page * page_size
    return (start, end)
