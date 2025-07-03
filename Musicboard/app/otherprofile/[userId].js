import { Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import axios from 'axios'
import Constants from 'expo-constants';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import login from '../(stack)/login'

const otherprofile = () => {
  const { userId } = useLocalSearchParams();
  const API_URL = Constants.expoConfig.extra.API_URL;
  const [realUserId, setRealUserId] = useState(null);
  const [user, setUser] = useState({});
  const [isFriend, setIsFriend] = useState(false);
  const [ratings, setRatings] = useState([]);
  console.log("OTHER USER'S USERID:::: ", userId);

  useFocusEffect(
    React.useCallback(() => {
      getUserInfo();
      getTop3Ratings();
    }, [])
  );

  useEffect(() => {
    checkFriendship();
  }, [user, realUserId]);



  const getUserInfo = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      setRealUserId(id);
      if (!userId || userId == null) return;

      const response = await axios.get(`${API_URL}/get-details/${userId}`);
      setUser(response.data.Message);

    } catch (error) {
      console.log(error);
      alert(error);
    }
  }

  const getTop3Ratings = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews`);

      if (response.data.Message == "Reviews fetched successfully from Redis Cache!" ||
        response.data.Message == "Reviews fetched successfully from MongoDB!") {

        const array = response.data.reviews.filter((review) => review.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));;
        setRatings(array.slice(0, 3));
      }

    } catch (error) {
      console.log(error);
      alert(error);
    }
  }

  const checkFriendship = async () => {
    try {
      const friends = user.friends || [];
      setIsFriend(friends.includes(realUserId));
      return;

    } catch (error) {
      console.log(error);
      alert(error);
    }
  }


  const handleAddFriend = async (user, friend) => {
    try {
      const response = await axios.post(`${API_URL}/${user}/add-friend/${friend}`, {});
      alert(response.data.Message);
      getUserInfo();
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }


  //console.log('OTHER USER PROFILE---> ', user);
  console.log('OTHER USERS TOP-3 RATINGS: ', ratings);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#151515" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.back}>
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign style={styles.back} name="left" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.heading}>
          <Text style={styles.h1}>{user?.username}</Text>
        </View>

        <Image source={user.dp ? { uri: user.dp } : require("../../assets/images/dp.png")} style={styles.img} />

        <View style={styles.greybox}>
          <TouchableOpacity style={styles.flexcol}>
            <Text style={styles.greytext}>{user?.reviews?.length || 0}</Text>
            <Text style={styles.greytext}>Ratings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flexcol}>
            <Text style={styles.greytext}>{user?.friends?.length || 0}</Text>
            <Text style={styles.greytext}>Followers</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.btnmove}>
          <TouchableOpacity style={styles.addButton} onPress={() => handleAddFriend(realUserId, userId)}>
            <Text style={styles.addButtonText}>{isFriend ? 'Remove Friend' : 'Add Friend'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ratediv}>
          <Text style={styles.ratetext}>Recently Rated:</Text>
          <View style={styles.ratingdiv}>
            {Array.isArray(ratings) && ratings.map((rating, index) => (
              <TouchableOpacity
                key={index}
                style={styles.singlediv}
                onPress={() => (rating.type === 'album') ? router.push(`/album/${rating.spotifyId}`) : router.push(`/song/${rating.spotifyId}`)}
              >
                <Image style={styles.albumImg} source={{ uri: rating.img }} />
                <Text style={styles.rtitle}>{rating.comment}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default otherprofile

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#151515",
    height: "100%",
    width: "100%",
    display: "flex",
  },
  scrollContainer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  back: {
    position: "absolute",
    left: "6%",
    top: "6%",
    zIndex: 10,
  },
  h1: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  img: {
    objectFit: "cover",
    width: 80,
    height: 80,
    position: "absolute",
    top: 70,
    right: "75%",
    borderRadius: 100,
  },
  greybox: {
    flexDirection: "row",
    gap: 40,
    marginTop: "15%",
    marginLeft: "3%",
    marginBottom: 10,
  },
  flexcol: {
    flexDirection: "column",
    alignItems: "center",
  },
  greytext: {
    color: "grey"
  },
  btnmove: {
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#FF6500',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#FF6500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  ratediv: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    paddingTop: 20,
  },
  ratetext: {
    color: "white",
    fontSize: 18,
    marginLeft: "2%",
    textAlign: "left",
    fontWeight: "800",
    fontFamily: "OpenSans-Bold"
  },
  ratingdiv: {
    flexDirection: "column",
    gap: 16,
    width: "100%",
    marginTop: "4%",
    alignSelf: "center"
  },
  singlediv: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 12,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  albumImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#444",
  },
  rtitle: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "OpenSans-Bold",
    width: "75%",
  },
});
