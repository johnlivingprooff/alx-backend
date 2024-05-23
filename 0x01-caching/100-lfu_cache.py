#!/usr/bin/python3
""" LFU Caching """
from base_caching import BaseCaching


class LFUCache(BaseCaching):
    """ LFU cache system that inherits from BaseCaching """
    def __init__(self):
        """ Initiliaze
        """
        super().__init__()
        self.order = []
        self.frequency = {}

    def put(self, key, item):
        """ Add an item in the cache
        """
        if key and item:
            if key in self.cache_data:
                self.cache_data[key] = item
                self.frequency[key] += 1
                self.order.remove(key)
            elif len(self.cache_data) >= BaseCaching.MAX_ITEMS:
                discard = self.order.pop(0)
                del self.cache_data[discard]
                del self.frequency[discard]
                print("DISCARD: {}".format(discard))
            self.cache_data[key] = item
            self.frequency[key] = 1
            self.order.append(key)

    def get(self, key):
        """ Get an item by key
        """
        if key in self.cache_data:
            self.frequency[key] += 1
            self.order.remove(key)
            self.order.append(key)
            return self.cache_data[key]
        return None
