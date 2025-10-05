import { StyleSheet, Text, View, SafeAreaView, Image, StatusBar, TouchableOpacity, Platform, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts } from 'expo-font'
import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router'
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import Loader from '../../components/Loader'


const Profile = () => {
    const [user, setUser] = useState({});
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [globalId, setGlobalId] = useState('');
    const API_URL = Constants.expoConfig.extra.API_URL;

    const [isl, setIsl] = useState(false);

    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {
            const getData = async () => {
                setLoading(true)
                const isLoggedIn = JSON.parse(await AsyncStorage.getItem("isLoggedIn"));
                setIsl(isLoggedIn);
                if (!isLoggedIn) {
                    return;
                }
                try {
                    const userId = await AsyncStorage.getItem("userId");
                    const response = await axios.get(`${API_URL}/get-details/${userId}`)

                    AsyncStorage.setItem('userId', userId)
                    setUser(response.data.Message);
                } catch (error) {
                    console.log('Error: ', error);
                    alert(error);
                }
                finally {
                    setLoading(false);
                }
            }

            const getRatings = async () => {
                setLoading(true)
                try {
                    const userId = await AsyncStorage.getItem("userId");
                    if (!userId) return;
                    setGlobalId(userId);
                    const response = await axios.get(`${API_URL}/${userId}/reviews`)
                    console.log('Response: ', response.data);
                    if (response.data.Message === "User does not exists!") {
                        setIsl(false);
                        return;
                    }
                    setRatings(response.data.reviews || []);
                    if (!Array.isArray(response.data.reviews)) {
                        console.error("Invalid response format:", response.data.reviews);
                        setRatings([]);
                        return;
                    }
                    // Use Promise.all to resolve all album requests in parallel
                    const albums = response.data.reviews.filter((review) => review.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
                    setRatings(albums.slice(0, 3));
                } catch (error) {
                    console.log('Error: ', error);
                    alert(error)
                }
                finally {
                    setLoading(false);
                }
            }

            // const getAlbumsInfo = async (spotifyId, type) => {
            //     setLoading(true)
            //     const token = await AsyncStorage.getItem('token');
            //     console.log('Album ID: ', spotifyId)
            //     try {
            //         let response = '';
            //         if (type === 'album') {
            //             response = await axios.get(`https://api.spotify.com/v1/albums/${spotifyId}`, {
            //                 headers: {
            //                     'Authorization': `Bearer ${token}`
            //                 }
            //             })
            //         }
            //         else if (type === 'track') {
            //             response = await axios.get(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
            //                 headers: {
            //                     'Authorization': `Bearer ${token}`
            //                 }
            //             })
            //         }
            //         return response.data

            //     } catch (error) {
            //         console.log('Error: ', error);
            //     }
            //     finally {
            //         setLoading(false);
            //     }
            // }

            getData();
            getRatings();
        }, [])
    );

    const navigateToSongs = async (spotifyId, type) => {
        try {
            if (type === 'album') {
                router.push(`album/${spotifyId}`);
            } else if (type === 'track') {
                router.push(`song/${spotifyId}`);
            }
        } catch (error) {
            console.log('Error: ', error)
            alert(error);
        }
    }

    const navigateToAll = async () => {
        try {
            router.push(`/allyourratings`);
        } catch (error) {
            console.log('Error: ', error)
            alert(error);
        }
    }

    const navigateToLogin = async () => {
        try {
            router.push('/login');
        } catch (error) {
            console.log('Error: ', error)
            alert(error);
        }
    }

    if (loading) {
        return (
            <Loader />
        )
    }
    //console.log('ISLOGGEDIN::::::::: ', isl);
    console.log('RATINGS OF MYSELF-> ', ratings);

    if (!isl) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#151515" />
                <View style={styles.notdiv}>
                    <Image source={require("../../assets/images/dp.png")} style={styles.notimg} />
                    <Text style={styles.nottext}>Oops, you have not logged in, please login to have a better experience on the app!</Text>
                    <TouchableOpacity style={styles.btn} onPress={navigateToLogin}>
                        <Text style={styles.btntext}>Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#151515" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.threedots}>
                    <TouchableOpacity onPress={() => router.push("/more")}>
                        <AntDesign name="ellipsis" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.heading}>
                    <Text style={styles.h1}>{user?.username}</Text>
                </View>
                <Image source={user?.dp ? { uri: user?.dp } : require("../../assets/images/dp.png")} style={styles.img} />

                <View style={styles.greybox}>
                    <TouchableOpacity style={styles.flexcol} onPress={navigateToAll}>
                        <Text style={styles.greytext}>{user?.reviews?.length || 0}</Text>
                        <Text style={styles.greytext}>Ratings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.flexcol} onPress={() => router.push(`/followers/${globalId}`)}>
                        <Text style={styles.greytext}>{user?.friends?.length || 0}</Text>
                        <Text style={styles.greytext}>Followers</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.ratediv}>
                    <Text style={styles.ratetext}>Recently Rated:</Text>
                    <View style={styles.ratingdiv}>
                        {Array.isArray(ratings) && ratings?.slice(0, 3).map((rating, index) => (
                            <TouchableOpacity
                                style={[styles.singlediv, {
                                    borderColor: (rating.type === 'album') ? '#000' : '#000'
                                }]}
                                key={index}
                                onPress={() => navigateToSongs(rating.spotifyId, rating.type)}
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

export default Profile

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
    threedots: {
        position: "relative",
        left: "40%",
        top: "20%",
        width: "max-content"
    },
    h1: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
        marginTop:12
    },
    img: {
        objectFit: "cover",
        width: 80,
        height: 80,
        position: "absolute",
        top: "35%",
        right: "75%",
        borderRadius: 100
    },
    greybox: {
        color: "grey",
        display: "flex",
        flexDirection: "row",
        gap: 40,
        position: "relative",
        left: "3%",
        top:"35%"
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
        top: "35%",
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
        width: "75%"
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
})