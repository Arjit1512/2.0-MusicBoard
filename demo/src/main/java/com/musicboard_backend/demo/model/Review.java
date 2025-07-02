package com.musicboard_backend.demo.model;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;


@Document(collection = "reviews")
public class Review {
    
    @Id
    private String id;
    private String name;
    private String type;
    private String spotifyId;
    private String img;
    private Integer stars;
    private String comment;
    private String date;
    private String userId;
    private String username;
    public Review() {
    }
    public Review(String id, String name, String type, String spotifyId, String img, Integer stars, String comment, String date,
            String userId, String username) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.spotifyId = spotifyId;
        this.img = img;
        this.stars = stars;
        this.comment = comment;
        this.date = date;
        this.userId = userId;
        this.username = username;
    }
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
    public String getSpotifyId() {
        return spotifyId;
    }
    public void setSpotifyId(String spotifyId) {
        this.spotifyId = spotifyId;
    }
    public String getImg() {
        return img;
    }
    public void setImg(String img) {
        this.img = img;
    }
    public Integer getStars() {
        return stars;
    }
    public void setStars(Integer stars) {
        this.stars = stars;
    }
    public String getComment() {
        return comment;
    }
    public void setComment(String comment) {
        this.comment = comment;
    }
    public String getDate() {
        return date;
    }
    public void setDate(String date) {
        this.date = date;
    }
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    @Override
    public String toString() {
        return "Review [id=" + id + ", name=" + name + ", type=" + type + ", spotifyId=" + spotifyId + ", img=" + img + ", stars=" + stars
                + ", comment=" + comment + ", date=" + date + ", userId=" + userId + ", username=" + username + "]";
    }
    

    
    
}
