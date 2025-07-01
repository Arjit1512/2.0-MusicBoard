package com.musicboard_backend.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class DemoApplication {
	public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./demo") // 👈 set to your .env location
                .ignoreIfMissing()
                .load();

        // ✅ Push all env variables to System properties so Spring can read them
        dotenv.entries().forEach(entry ->
            System.setProperty(entry.getKey(), entry.getValue())
        );

        SpringApplication.run(DemoApplication.class, args);
    }

}
