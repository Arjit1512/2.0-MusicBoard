import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';

const Followers = () => {
  const { userId } = useLocalSearchParams();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = Constants.expoConfig.extra.API_URL;

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // 1. Get user details
        const userResponse = await axios.get(`${API_URL}/get-details/${userId}`);
        const friendIds = userResponse.data.Message.friends;

        // 2. Get each friend's info
        const friendsData = await Promise.all(friendIds.map(async (id) => {
          const res = await axios.get(`${API_URL}/get-details/${id}`);
          return res.data.Message;
        }));

        setFriends(friendsData);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [userId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color="#000" />;

  return (
    <SafeAreaView style={styles.fullPage}>
      <View style={styles.back}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign style={styles.back} name="left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Friends ({friends.length})</Text>
        {friends.map((friend, index) => (
          <View key={index} style={styles.card}>
            <Image source={{ uri: friend.dp }} style={styles.dp} />
            <Text style={styles.name}>{friend.username}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Followers;

const styles = StyleSheet.create({
  fullPage: {
    flex: 1,
    backgroundColor: '#151515',
    fontFamily: "OpenSans-Bold"
  },
  back: {
    position: "absolute",
    left: "4%",
    top: "8%",
    zIndex: 10
  },
  container: {
    padding: 20,
    alignItems: 'center',
    paddingTop:0
  },
  title: {
    color: "white",
    textTransform: "uppercase",
    fontFamily: 'OpenSans-Bold',
    textAlign: "center",
    fontSize: 22,
    marginVertical: 15,
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 15
  },
  dp: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#333'
  },
  name: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: "OpenSans"
  }
});