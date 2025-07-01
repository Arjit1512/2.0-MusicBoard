import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import axios from 'axios'
import Constants from 'expo-constants';
import { useLocalSearchParams, router } from 'expo-router'
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

  useEffect(() => {
    getUserInfo();
    getTop3Ratings();
  }, []);

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
      <View style={styles.back}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign style={styles.back} name="left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.heading}>
        <Text style={styles.h1}>{user?.username}</Text>

        <Image source={user.dp ? { uri: user.dp } : require("../../assets/images/dp.png")} style={styles.img} />
      </View>

      <View style={styles.greybox}>
        <View style={styles.flexcol}>
          <Text style={styles.greytext}>{user?.reviews?.length || 0}</Text>
          <Text style={styles.greytext}>Ratings</Text>
        </View>
        <View style={styles.flexcol}>
          <Text style={styles.greytext}>{user?.friends?.length || 0}</Text>
          <Text style={styles.greytext}>Followers</Text>
        </View>
      </View>
      <View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleAddFriend(realUserId, userId)}>
          <Text style={styles.addButtonText}>{isFriend ? 'Remove Friend' : 'Add Friend'}</Text>
        </TouchableOpacity>

      </View>
      <View style={styles.ratediv}>
        <Text style={styles.ratetext}>Recently Rated:</Text>
        <View style={styles.ratingdiv}>
          {Array.isArray(ratings) && ratings.map((rating, index) => (
            <TouchableOpacity style={[styles.singlediv,
            { borderColor: (rating.type === 'album') ? '#000' : '#000' }
            ]} key={index} onPress={() => (rating.type === 'album') ? router.push(`/album/${rating.spotifyId}`) : router.push(`/song/${rating.spotifyId}`)}>
              <Image style={[styles.albumImg,
              ]} source={{ uri: rating.img }} />
              <Text style={styles.rtitle}>{rating.comment}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default otherprofile

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#151515",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  back: {
    position: "absolute",
    left: "4%",
    top: "6%",
    zIndex: 10
  },
  threedots: {
    position: "relative",
    left: "40%",
    top: "3.5%",
    width: "max-content"
  },
  h1: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  img: {
    objectFit: "cover",
    width: 80,
    height: 80,
    position: "relative",
    top: "25%",
    right: "35%",
    borderRadius: 100
  },
  greybox: {
    color: "grey",
    display: "flex",
    flexDirection: "row",
    gap: 40,
    position: "relative",
    left: "5%"
  },
  flexcol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    bottom: "85%"
  },
  greytext: {
    color: "grey"
  },
  ratediv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    position: "relative",
    top: "2%",
    width: "100%",
    paddingTop: 10
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
    width: "94%",
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
  },

  notdiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  },
  notimg: {
    objectFit: "cover",
    width: 80,
    height: 80,
    borderRadius: 100,
    opacity: 0.6
  },
  nottext: {
    color: "grey",
    textAlign: "center",
    fontSize: 14,
    width: "75%",
    marginTop: "5%",
    fontFamily: "OpenSans"
  },
  btn: {
    height: 50,
    width: 140,
    padding: 4,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    color: "white",
    borderRadius: 10,
    position: "relative",
    top: 20
  },
  btntext: {
    fontSize: 12,
    color: "#",
    fontFamily: "OpenSans-Bold",
    fontWeight: "600"
  },
  addButton: {
    backgroundColor: '#FF6500', // Spotify green for a modern vibe
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
})