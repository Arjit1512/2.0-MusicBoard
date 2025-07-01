package com.musicboard_backend.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.musicboard_backend.demo.model.Review;

public interface ReviewRepository extends MongoRepository<Review, String> {
    // we don't even require logic for these functions, coz we imported Spring Data MongoDB DEPENDENCY 
    List<Review> findByUserId(String userId);
    List<Review> findBySpotifyId(String spotifyId);
    List<Review> findTop100ByOrderByDateDesc();
    List<Review> findTop20BySpotifyId(String spotifyId);

}



