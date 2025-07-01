package com.musicboard_backend.demo.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.musicboard_backend.demo.model.Review;
import com.musicboard_backend.demo.model.User;
import com.musicboard_backend.demo.repository.ReviewRepository;
import com.musicboard_backend.demo.repository.UserRepository;
import com.musicboard_backend.demo.service.RedisService;
import com.musicboard_backend.demo.service.S3Service;

@CrossOrigin(origins = "http://localhost:8081")
@RestController
public class UserController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private ReviewRepository revrepo;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private RedisService redisService;

    @GetMapping("/")
    public String index() {
        return "Server running on port 8080.";
    }

    // LOGIN-SECTION

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam("dp") MultipartFile dp) {

        Map<String, Object> response = new HashMap<>();
        if (username == null || password == null || username.isEmpty() || password.isEmpty()) {
            response.put("Message", "username and password are required!");
            return ResponseEntity.status(409).body(response);
        }

        User existingUser = repo.findByUsername(username).orElse(null);

        if (existingUser != null) {
            response.put("Message", "User already exists with same username!");
            return ResponseEntity.status(409).body(response);
        }

        User newuser = new User();

        String dpUrl = "";
        try {
            dpUrl = s3Service.uploadFile(dp);
        } catch (IOException e) {
            response.put("Message", "DP upload failed");
            return ResponseEntity.status(500).body(response);
        }

        newuser.setUsername(username);
        newuser.setPassword(password);
        newuser.setDp(dpUrl);
        repo.save(newuser);

        response.put("Message", "User added successfully!");
        response.put("userId", newuser.getId());
        response.put("dp", dpUrl);
        return ResponseEntity.status(200).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User existingUser = repo.findByUsername(user.getUsername()).orElse(null);

        if (user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.status(409).body("Username and password are required!");
        }

        if (existingUser == null) {
            return ResponseEntity.status(409).body("User doesn't exists!");
        }

        if (!existingUser.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(409).body("Incorrect password!");
        }

        Map<String, String> response = new HashMap<>();
        response.put("userId", existingUser.getId());
        response.put("Message", "User logged in successfully!");
        return ResponseEntity.status(200).body(response);

    }

    // REVIEW-ALBUM-SECTION
    @PostMapping("{id}/add-review/{albumId}")
    public ResponseEntity<?> add_review(@PathVariable String id, @PathVariable String albumId,
            @RequestBody Review review) {

        User existingUser = repo.findById(id).orElse(null);

        if (existingUser == null) {
            return ResponseEntity.status(409).body("User doesn't exists!");
        }

        review.setUserId(id);
        review.setUsername(existingUser.getUsername());
        review.setDate(new Date().toInstant().toString());

        Review savedReview = revrepo.save(review);

        List<String> reviews = existingUser.getReviews();
        if (reviews == null) {
            reviews = new ArrayList<>();
        }
        reviews.add(savedReview.getId());
        existingUser.setReviews(reviews);
        repo.save(existingUser);
        redisService.deleteReviewsCache(); // <- Invalidate cache after new review


        Map<String, String> response = new HashMap<>();
        response.put("Message", "Review added successfully");
        response.put("new_review_id", savedReview.getId());
        return ResponseEntity.status(200).body(response);
    }

    @DeleteMapping("{id}/delete-review/{reviewId}")
    public ResponseEntity<?> delete_review(@PathVariable String id, @PathVariable String reviewId) {

        User existingUser = repo.findById(id).orElse(null);

        if (existingUser == null) {
            return ResponseEntity.status(409).body("User doesn't exists!");
        }

        Review review = revrepo.findById(reviewId).orElse(null);
        if (review == null) {
            return ResponseEntity.status(409).body("Review doesn't exists!");
        }

        List<String> reviews = existingUser.getReviews();
        reviews.removeIf(i -> i.equals(review.getId()));
        existingUser.setReviews(reviews);
        repo.save(existingUser);
        revrepo.delete(review);
        redisService.deleteReviewsCache(); // <- Invalidate cache after new review


        Map<String, String> response = new HashMap<>();
        response.put("Message", "Review deleted successfully");
        return ResponseEntity.status(200).body(response);
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<?> show_reviews(@PathVariable String id) {
        User existingUser = repo.findById(id).orElse(null);

        if (existingUser == null) {
            Map<String, String> response = new HashMap<>();
            response.put("Message","User doesn't exists!");
            return ResponseEntity.status(409).body(response);
        }

        // coz in ReviewRepository.java file, we have mentioned
        // List<Review> findByUserId(String userId);
        List<Review> reviews = revrepo.findByUserId(id);

        Map<String, List<Review>> response = new HashMap<>();
        response.put("reviews", reviews);
        return ResponseEntity.status(200).body(response);
    }

    @GetMapping("/reviews")
    public ResponseEntity<?> get_reviews() {

        Map<String, Object> response = new HashMap<>();
        List<Review> cachedReviews = redisService.getReviewsFromCache();
        if (cachedReviews != null) {
            response.put("Message", "Reviews fetched successfully from Redis Cache!");
            response.put("reviews", cachedReviews);
            return ResponseEntity.status(200).body(response);
        }

        // for working of below line, go and write this line in ReviewRepository.java
        // List<Review> findTop100ByOrderByDateDesc();
        List<Review> reviews = revrepo.findTop100ByOrderByDateDesc();
        redisService.saveReviewsToCache(reviews);

        response.put("Message", "Reviews fetched successfully from MongoDB!");
        response.put("reviews", reviews);
        return ResponseEntity.status(200).body(response);
    }

    @GetMapping("/show-reviews/{spotifyId}")
    public ResponseEntity<?> showReviews(@PathVariable String spotifyId) {

        List<Review> reviews = revrepo.findTop20BySpotifyId(spotifyId);

        Map<String, Object> response = new HashMap<>();
        response.put("Message", "Reviews fetched successfully!");
        response.put("reviews", reviews);
        return ResponseEntity.status(200).body(response);
    }

    // FRIENDS-SECTION
    @PostMapping("/{id}/add-friend/{friendId}")
    public ResponseEntity<?> add_friend(@PathVariable String id, @PathVariable String friendId) {

        User user = repo.findById(id).orElse(null);
        User friend = repo.findById(friendId).orElse(null);
        Map<String, String> response = new HashMap<>();

        if (user == null) {
            response.put("Error", "User does not exists!");
            return ResponseEntity.status(409).body(response);
        }

        if (friend == null) {
            response.put("Error", "Friend does not exists!");
            return ResponseEntity.status(409).body(response);
        }

        if (user.getId().equals(friend.getId())) {
            response.put("Error", "You can't add yourself!");
            return ResponseEntity.status(409).body(response);
        }

        List<String> friends = user.getFriends();
        boolean friendship = friends.contains(friend.getId());

        if (friendship) {
            user.getFriends().remove(friendId);
            friend.getFriends().remove(id);
            repo.save(user);
            repo.save(friend);
            response.put("Message", "Friend deleted successfully");
            return ResponseEntity.status(200).body(response);
        }

        user.getFriends().add(friendId);
        friend.getFriends().add(id);
        repo.save(user);
        repo.save(friend);

        response.put("Message", "Friend added successfully");
        return ResponseEntity.status(200).body(response);
    }

    // GET-USER-INFO SECTION
    @GetMapping("/get-details/{id}")
    public ResponseEntity<?> get_details(@PathVariable String id) {

        User existingUser = repo.findById(id).orElse(null);
        Map<String, Object> response = new HashMap<>();
        if (existingUser == null) {
            response.put("Error", "User does not exists!");
            return ResponseEntity.status(409).body(response);
        }

        response.put("Message", existingUser);
        return ResponseEntity.status(200).body(response);
    }

}
