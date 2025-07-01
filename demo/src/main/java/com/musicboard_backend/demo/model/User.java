package com.musicboard_backend.demo.model;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

import org.springframework.data.annotation.Id;
import com.musicboard_backend.demo.model.Review;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String password;
    private String dp;
    List<String> reviews;
    List<String> friends;
    
    public User() {
    }

    public User(String id, String username, String password, String dp, List<String> reviews, List<String> friends) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.dp = dp;
        this.reviews = reviews;
        this.friends = friends;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDp() {
        return dp;
    }

    public void setDp(String dp) {
        this.dp = dp;
    }

    public List<String> getReviews() {
        return reviews;
    }

    public void setReviews(List<String> reviews) {
        this.reviews = reviews;
    }

    public List<String> getFriends() {
        return friends;
    }

    public void setFriends(List<String> friends) {
        this.friends = friends;
    }

    @Override
    public String toString() {
        return "User [id=" + id + ", username=" + username + ", password=" + password + ", dp=" + dp + ", reviews="
                + reviews + ", friends=" + friends + "]";
    }
    
   

}
