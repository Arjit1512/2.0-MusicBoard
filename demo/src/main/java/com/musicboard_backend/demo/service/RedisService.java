package com.musicboard_backend.demo.service;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicboard_backend.demo.model.Review;

@Service
public class RedisService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private final ObjectMapper mapper = new ObjectMapper();

    public void saveReviewsToCache(List<Review> reviews) {
        try {
            String json = mapper.writeValueAsString(reviews);
            redisTemplate.opsForValue().set("global:reviews", json, Duration.ofHours(24));
        } catch (JsonProcessingException e) {
            System.out.println("Failed to serialize reviews: " + e.getMessage());
        }
    }

    public List<Review> getReviewsFromCache() {
        try {
            String json = redisTemplate.opsForValue().get("global:reviews");
            if (json == null) return null;

            return Arrays.asList(mapper.readValue(json, Review[].class));
        } catch (IOException e) {
            System.out.println("Failed to deserialize cached reviews: " + e.getMessage());
            return null;
        }
    }

    public void deleteReviewsCache() {
        redisTemplate.delete("global:reviews");
    }
}
