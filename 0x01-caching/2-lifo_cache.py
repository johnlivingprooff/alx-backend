#!/usr/bin/python3
""" LIFO caching """
from base_caching import BaseCaching


class LIFOCache(BaseCaching):
    """ LIFO cache system that inherits from BaseCaching """
    def __init__(self):
        """ Initiliaze
        """
        super().__init__()
        self.order = []

    def put(self, key, item):
        """ Add an item in the cache
        """
        if key and item:
            if key in self.cache_data:
                self.cache_data[key] = item
                return
            if len(self.cache_data) >= BaseCaching.MAX_ITEMS:
                discard = self.order.pop()
                del self.cache_data[discard]
                print("DISCARD: {}".format(discard))
            self.cache_data[key] = item
            self.order.append(key)

    def get(self, key):
        """ Get an item by key
        """
        return self.cache_data.get(key, None)
