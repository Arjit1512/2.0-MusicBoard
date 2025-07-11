import { StyleSheet, StatusBar, Text, TextInput, View, SafeAreaView, Image, ScrollView, TouchableOpacity, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useFonts } from 'expo-font';
import Constants from 'expo-constants';
import { FontAwesome, AntDesign, Entypo } from 'react-native-vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../../components/Loader'
import { Linking, Alert } from 'react-native';

const Track = () => {

    const { songId } = useLocalSearchParams();
    const API_URL = Constants.expoConfig.extra.API_URL;
    console.log('SONG ID THAT WE NAVIGATED IS: ', JSON.stringify(songId));
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [no, setNo] = useState(0);
    const [song, setSong] = useState({
        name: '',
        duration: '',
        artistName: '',
        link: '',
        img: ''
    })
    let fontsLoaded = useFonts({
        "OpenSans": require("../../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../../assets/fonts/OpenSans-Bold.ttf"),
        "OpenSans-Italic": require("../../../assets/fonts/OpenSans-Italic.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {
            const getSong = async () => {
                setLoading(true)
                const token = await AsyncStorage.getItem('token');
                if (!token || !songId) {
                    alert("Server fault, Please try again after some time!")
                    return;
                }
                try {
                    const response = await axios.get(`https://api.spotify.com/v1/tracks/${songId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })

                    setSong({
                        name: response.data.name,
                        id: response.data.id,
                        duration: parseFloat(response.data.duration_ms / 60000).toFixed(2),
                        pop: parseInt(response.data.popularity),
                        artistName: response.data.artists[0].name,
                        link: response.data.uri,
                        exp: response.data.explicit,
                        img: response.data.album.images[0].url
                    })

                    const ans = await getavgRatingSong()
                    console.log('answer: ', ans)
                    setRating(ans.avg);
                    setNo(ans.no);

                } catch (error) {
                    console.log('Error: ', error)
                    alert(error)
                } finally {
                    setLoading(false)
                }
            }

            const getReviews = async () => {
                setLoading(true)
                if (!songId) {
                    alert("Server fault, Please try again after some time!")
                    return;
                }
                try {
                    const response = await axios.get(`${API_URL}/show-reviews/${songId}`)
                    if (response.data.Message === "Reviews fetched successfully!") {
                        setReviews(response.data.reviews);
                    }
                } catch (error) {
                    console.log('Error: ', error)
                    alert(error)
                } finally {
                    setLoading(false)
                }
            }

            getSong();
            getReviews();
        }, [])
    )

    const navigateTo = async (songId) => {
        setLoading(true);
        try {
            await Linking.openURL(songId);
        } catch (error) {
            console.log('Error: ', error);
            Alert.alert("Error", "Something went wrong. Please make sure that you have Spotify installed.");
        } finally {
            setLoading(false);
        }
    };


    const getavgRatingSong = async () => {
        try {
            const response = await axios.get(`${API_URL}/reviews`);

            const filteredArray = response.data.reviews.filter((item) => item.spotifyId === songId & item.type === 'track');
            if (filteredArray.length === 0) return 0;
            const sum = filteredArray.reduce((acc, item) => acc + item.stars, 0);

            const obj = {
                avg: parseFloat(sum / filteredArray.length).toFixed(2),
                no: filteredArray.length
            }
            return obj;
        } catch (error) {
            console.log('Error: ', error)
            alert(error)
            return 0;
        }
    }


    const handlePress = async () => {
        setLoading(true)
        try {
            await AsyncStorage.setItem('songId', songId);
            await AsyncStorage.setItem('albumDp', song.img);
            await AsyncStorage.setItem('aName', song.name);
            await AsyncStorage.setItem('type', 'track')
            router.push("/rating");
        } catch (error) {
            console.log('Error: ', error)
        }
        finally {
            setLoading(false);
        }
    }

    const formatDuration = (duration) => {
        const minutes = Math.floor(duration);
        const seconds = Math.round((duration - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };



    // console.log('SONG: ', song)

    if (loading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <StatusBar barStyle="light-content" backgroundColor="#151515" />
                <View style={styles.back}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign name="arrowleft" size={32} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.movediv}>
                    <Text style={styles.ta2}>Song Info </Text>

                    <Image style={styles.dp2} source={{ uri: song?.img }} />
                    <TouchableOpacity style={styles.btn} onPress={handlePress}>
                        <Text style={styles.btntext}>Rate Song</Text>
                    </TouchableOpacity>
                    {(no > 0) ? (
                        <View style={styles.rdiv}>
                            <View style={styles.rinsidediv}>
                                <Entypo name='star' size={24} color='#1DB954' />
                                <Text style={styles.rtext}>Total Ratings:  <Text style={styles.bold}>{no}</Text></Text>
                            </View>
                            <View style={styles.rinsidediv}>
                                <Entypo name='star' size={24} color='#1DB954' />
                                <Text style={styles.rtext}>Rating:  <Text style={styles.bold}>{rating}</Text>/5</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.ndiv}>
                            <Text style={styles.nrtext}>No one has rated this song yet.</Text>
                            <Text style={styles.nrtext}>Be the first one to rate.
                                {/* <Text onPress={handlePress} style={styles.spanr}>Rate Now</Text> */}
                            </Text>
                        </View>
                    )}

                    {(no > 0) && (
                        <View style={styles.col}>
                            <Text style={styles.tr}>Top Reviews</Text>
                            {reviews.map((item, index) => {
                                return (
                                    <View style={styles.row} key={index}>
                                        {/* <Image style={styles.dp} source={{ uri: item.img }}></Image> */}

                                        <View style={styles.col} key={index}>
                                            <View style={styles.stars}>
                                                {[...Array(5)].map((_, i) => (
                                                    <FontAwesome
                                                        key={i}
                                                        name={i < item.stars ? 'star' : 'star-o'}
                                                        size={16}
                                                        color={"#1DB954"}
                                                    />
                                                ))}
                                            </View>
                                            <Text style={styles.result}>{item?.comment || ''}</Text>
                                            <Text style={styles.spanx}>• Posted by {item?.username} on {new Date(item.date).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>

                    )}




                    <View style={styles.songInfoContainer}>
                        <Text style={styles.songText}>Name: <Text style={styles.span}> {song?.name}</Text></Text>
                        <Text style={styles.songText}>Duration: <Text style={styles.span}> {formatDuration(song?.duration)}sec</Text></Text>
                        <Text style={styles.songText}>Artist: <Text style={styles.span}> {song?.artistName}</Text></Text>
                        <Text style={styles.songText}>Recommended Level: <Text style={styles.span}> {Math.abs(song?.pop - 3)}%</Text></Text>
                        <Text style={styles.songText}>Explicit Lyrics: <Text style={styles.span}> {(song.exp === true) ? 'Yes' : 'No'}</Text></Text>

                        <TouchableOpacity style={styles.btn2} onPress={() => navigateTo(song?.link)}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={styles.btntext2}>Listen on Spotify</Text>
                                <FontAwesome name="spotify" size={24} style={{ marginLeft: 6 }} />
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Track
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#121212",
        height: "100%",
        display: "flex",
        width: "100%",
        alignItems: "center"
    },
    back: {
        zIndex: 100,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        top: Platform.OS == 'android' ? '5%' : '0%',
        left: Platform.OS == 'android' ? '4%' : '0%',
    },
    movediv: {
        position: "relative",
        bottom: 10
    },
    btn: {
        height: 50,
        width: 140,
        padding: 4,
        textAlign: "center",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1DB954",
        color: "white",
        borderRadius: 25,
    },
    btntext: {
        fontSize: 12,
        color: "#FFFFFF",
        fontFamily: "OpenSans-Bold",
        fontWeight: "700",
        letterSpacing: 0.8
    },
    bold: {
        fontFamily: "OpenSans-Bold"
    },
    ta2: {
        color: "white",
        textTransform: "uppercase",
        fontFamily: 'OpenSans-Bold',
        textAlign: "center",
        fontSize: 24,
        marginTop: 20,
        letterSpacing: 1.2,
        marginBottom: 10
    },
    dp2: {
        width: 240,
        height: 240,
        borderRadius: 20,
        marginBottom: 20,
        borderColor: "transparent",
        borderWidth: 0,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10
    },
    into: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 50,
        padding: 8
    },
    songInfoContainer: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: 'rgba(30, 30, 30, 0.6)',
        width: 360,
        alignSelf: "center",
        borderRadius: 24,
        marginTop: 16,
        padding: 24,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(29, 185, 84, 0.3)',
        marginBottom: 30
    },
    songText: {
        color: "white",
        fontFamily: "OpenSans-Bold",
        fontWeight: "800",
        fontSize: 16,
        marginBottom: 12,
        letterSpacing: 0.5
    },
    btn2: {
        height: 55,
        width: '80%',
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1DB954",
        color: "white",
        borderRadius: 30,
        marginTop: 25,
        borderColor: "transparent",
        borderWidth: 0,
        alignSelf: "center",
        flexDirection: "row",
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6
    },
    span: {
        color: "rgba(255, 255, 255, 0.7)",
        fontFamily: "OpenSans",
        fontSize: 15,
        letterSpacing: 0.3,
    },
    btntext2: {
        fontSize: 16,
        color: "#FFFFFF",
        fontFamily: "OpenSans-Bold",
        fontWeight: "700",
        position: "relative",
        bottom: 0,
        letterSpacing: 1
    },

    // rating section
    rdiv: {
        backgroundColor: "transparent",
        height: 50,
        marginTop: 12,
        width: "94%",
        borderRadius: 12,
        alignSelf: "center",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 33
    },
    rinsidediv: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    rtext: {
        color: "grey",
        fontSize: 13,
        fontFamily: "OpenSans"
    },
    ndiv: {
        backgroundColor: "#0B192C",
        height: 50,
        marginTop: 12,
        width: "94%",
        borderRadius: 12,
        alignSelf: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    spanr: {
        fontWeight: "800",
        textDecorationLine: "underline",
        fontFamily: "OpenSans-Bold"
    },
    nrtext: {
        color: "grey",
        fontSize: 13,
        fontFamily: "OpenSans-Italic"
    },


    //reviews section
    col: {
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'space-between',
        backgroundColor: '#151515',
        width: "100%",
        padding: 8,
        marginTop: 10
    },
    tr: {
        color: "white",
        fontFamily: 'OpenSans-Bold',
        textAlign: "left",
        fontSize: 20,
        marginVertical: 10
    },
    each: {
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#252525",
        width: "100%",
        borderWidth: 0.2,
        alignSelf: "center",
    },

    stars: {
        display: "flex",
        flexDirection: "row",
        marginTop: 10,
        paddingHorizontal: 16,
    },
    col: {
        display: "flex",
        flexDirection: "column",
        marginLeft: 0,
        justifyContent: "center",
        flex: 1,
    },
    result: {
        color: '#E2DFD0',
        fontSize: 12,
        paddingVertical: 6,
        paddingHorizontal: 16,
        lineHeight: 18,
    },
    resultb: {
        color: 'white',
        fontSize: 12,
        width: "90%",
        fontFamily: "OpenSans-Bold",
        paddingVertical: 5,
        lineHeight: 18,
    },
    p: {
        color: 'grey',
        fontSize: 12,
        paddingVertical: 5,
        lineHeight: 18,
    },
    dp: {
        width: 55,
        height: 55,
        borderRadius: 6,
        marginLeft: 6,
        borderWidth: 1,
        borderColor: "grey",
        marginVertical: 6
    },
    whitediv: {
        backgroundColor: "#414141",
        borderRadius: 6,
        display: "flex",
        flexDirection: "row",
        borderWidth: 0.2,

    },
    whitecoldiv: {
        display: "flex",
        flexDirection: "column",
        marginLeft: 12,
    },
    spanx: {
        fontSize: 10,
        color: "grey",
        marginTop: 6,
        fontStyle: "italic"
    },
    row: {
        display: "flex",
        flexDirection: "row",
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        backgroundColor: "#252525",
        width: "100%",
        borderWidth: 0.2,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center"
    }
});                                                     