import { StyleSheet, Text, View, SafeAreaView, ScrollView, StatusBar, Image, TouchableOpacity, Platform } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFonts } from 'expo-font';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import { FontAwesome, AntDesign } from 'react-native-vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Loader from '../../../components/Loader'
import { Linking } from 'react-native';
import { Entypo } from '@expo/vector-icons';

const Songs = () => {
    const { albumId } = useLocalSearchParams();
    const API_URL = Constants.expoConfig.extra.API_URL;
    const [songs, setSongs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [no, setNo] = useState(0);
    const [albumInfo, setAlbumInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState(false);
    const [song, setSong] = useState({});

    let fontsLoaded = useFonts({
        "OpenSans": require("../../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../../assets/fonts/OpenSans-Bold.ttf"),
        "OpenSans-Italic": require("../../../assets/fonts/OpenSans-Italic.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {
            const getSongs = async () => {
                setLoading(true)
                const token = await AsyncStorage.getItem('token');
                console.log('Album ID: ', albumId)
                if (!albumId) {
                    alert("No album selected!")
                    return;
                }
                try {
                    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    setSongs(response.data.tracks.items.map((song) => ({
                        name: song.name,
                        id: song.id,
                        singer: song.artists[0].name
                    })))
                    setAlbumInfo({
                        length: response.data.tracks.items.length,
                        dp: response.data.images[0].url,
                        title: response.data.name,
                        rd: response.data.release_date
                    });

                    const ans = await getavgRatingAlbum()
                    setRating(ans.avg);
                    setNo(ans.no);

                } catch (error) {
                    console.log('Error: ', error);
                }
                finally {
                    setLoading(false);
                }
            }

            const getReviews = async () => {
                setLoading(true)
                if (!albumId) {
                    alert("Server fault, Please try again after some time!")
                    return;
                }
                try {
                    const response = await axios.get(`${API_URL}/show-reviews/${albumId}`)
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

            getSongs();
            getReviews();
        }, [])
    )

    const handlePress = async () => {
        setLoading(true)
        try {
            await AsyncStorage.setItem('albumId', albumId);
            await AsyncStorage.setItem('albumDp', albumInfo.dp);
            await AsyncStorage.setItem('aName', albumInfo.title);
            await AsyncStorage.setItem('type', 'album');
            router.push("/rating");
        } catch (error) {
            console.log('Error: ', error)
        }
        finally {
            setLoading(false);
        }
    }

    const getavgRatingAlbum = async () => {
        try {
            const response = await axios.get(`${API_URL}/reviews`);

            const filteredArray = response.data.reviews.filter((item) => item.spotifyId === albumId & item.type === 'album');
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

    const navigateTo = async (songId) => {
        try {
            Linking.openURL(songId);
        } catch (error) {
            console.log('Error: ', error)
            alert(error)
        }
        finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#151515" />
                <View style={styles.back}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign style={styles.back} name="arrowleft" size={32} color="white" />
                    </TouchableOpacity>
                </View>

                {popup && (
                    <View style={styles.fullScreenContainer}>
                        <BlurView intensity={50} tint="dark" style={styles.blurBackground} />
                        <View style={styles.popupContainer}>
                            <Text style={styles.ta2}>Song Info</Text>
                            <TouchableOpacity style={styles.into} onPress={() => setPopup(false)}>
                                <AntDesign name="close" size={24} color="white" />
                            </TouchableOpacity>
                            <Image style={styles.dp2} source={{ uri: song.img }} />
                            <View style={styles.songInfoContainer}>
                                <Text style={styles.songText}>Name: <Text style={styles.span}> {song.name}</Text></Text>
                                <Text style={styles.songText}>Duration: <Text style={styles.span}> {song.duration}min</Text></Text>
                                <Text style={styles.songText}>Artist: <Text style={styles.span}> {song.artistName}</Text></Text>
                                <View style={styles.samerow}>
                                    {/* <TouchableOpacity style={styles.btn2} onPress={() => navigateTo(song.link)}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={styles.btntext2}>Listen on Spotify</Text>
                                            <FontAwesome name="spotify" size={24} style={{ marginLeft: 6 }} />
                                        </View>
                                    </TouchableOpacity> */}
                                    <TouchableOpacity style={styles.btn22} onPress={() => router.push(`song/${song.id}`)}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={styles.btntext2}>Rate Song</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                    </View>
                )}

                <Image style={styles.dp} source={{ uri: albumInfo.dp }}></Image>
                <Text style={styles.ta}>{albumInfo.title}</Text>
                <Text style={styles.p}>Album • {albumInfo.rd} • {albumInfo.length === 1 ? `${albumInfo.length} track` : `${albumInfo.length} tracks`}</Text>
                <TouchableOpacity style={styles.btn} onPress={handlePress}>
                    <Text style={styles.btntext}>Rate Album</Text>
                </TouchableOpacity>
                {(no > 0) ? (
                    <View style={styles.rdiv}>
                        <View style={styles.rinsidediv}>
                            <Entypo name='star' size={24} color='#FF6500' />
                            <Text style={styles.rtext}>Total Ratings: <Text style={styles.bold}>{no}</Text></Text>
                        </View>
                        <View style={styles.rinsidediv}>
                            <Entypo name='star' size={24} color='#FF6500' />
                            <Text style={styles.rtext}>Rating:  <Text style={styles.bold}>{rating}</Text>/5</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.ndiv}>
                        <Text style={styles.nrtext}>No one has rated this album yet.</Text>
                        <Text style={styles.nrtext}>Be the first one to rate.
                            {/* <Text onPress={handlePress} style={styles.spanr}>Rate Now</Text> */}
                        </Text>
                    </View>
                )}

                {(no > 0) && (
                    <View style={styles.col1}>
                        <Text style={styles.tr}>Top Reviews</Text>
                        {reviews.map((item, index) => {
                            return (
                                <View style={styles.row} key={index}>
                                    {/* <Image style={styles.dp} source={{ uri: item.img }}></Image> */}

                                    <View style={[styles.col1, { paddingHorizontal: 0 }]} key={index}>
                                        <View style={styles.stars}>
                                            {[...Array(5)].map((_, i) => (
                                                <FontAwesome
                                                    key={i}
                                                    name={i < item.stars ? 'star' : 'star-o'}
                                                    size={16}
                                                    color={"#FF6500"}
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



                <View style={styles.col}>
                    <Text style={styles.tr}>Tracks</Text>
                    {songs.map((song, index) => {
                        return (
                            <TouchableOpacity key={index} style={styles.eachcol} onPress={() => router.push(`song/${song.id}`)}>
                                <Text style={styles.result}>{index + 1}. {song.name}</Text>
                                <Text style={styles.no}>{song.singer}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Songs

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#151515"
    },
    back: {
        position: "absolute",
        right: "85%",
        top: "1%",
        zIndex: 10,
        borderRadius: 4,
        height: 34,
        width: 24,
        left: Platform.OS == 'android' ? '4%' : '0%',
    },
    btn: {
        height: 50,
        width: 140,
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6500",
        color: "white",
        borderRadius: 25,
        marginTop: "2%"
    },
    bold: {
        fontFamily: "OpenSans-Bold"
    },
    btntext: {
        fontSize: 12,
        color: "white",
        fontFamily: "OpenSans-Bold",
        fontWeight: "700"
    },
    dp: {
        width: 250,
        height: 270,
        borderRadius: 12,
        marginTop: 15,
        borderColor: "grey",
        borderWidth: 1,
        elevation: 10
    },
    container: {
        backgroundColor: "#151515",
        display: "flex",
        width: "100%",
        alignItems: "center",
        paddingBottom: 0,
        position: 'relative',
        top: Platform.OS == 'android' ? '4%' : '0%',
    },
    ta: {
        color: "white",
        textTransform: "uppercase",
        fontFamily: 'OpenSans-Bold',
        textAlign: "center",
        fontSize: 20,
        marginTop: 10
    },
    tr: {
        color: "white",
        fontFamily: 'OpenSans-Bold',
        textAlign: "left",
        fontSize: 20,
        marginBottom: 10
    },
    p: {
        color: "grey",
        fontSize: 14,
        marginVertical: 8
    },
    col: {
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'space-between',
        backgroundColor: '#151515',
        width: "100%",
        padding: 8,
        marginTop: -12
    },
    eachcol: {
        backgroundColor: "black",
        borderWidth: 2,
        borderColor: "grey",
        borderRadius: 12,
        padding: 6,
        marginBottom: 12
    },
    diffrow: {
        display: "flex",
        flex: 1,
        flexDirection: 'column',
    },
    albimage: {
        width: 90,
        height: 90,
        objectFit: "cover"
    },
    no: {
        color: "grey",
        fontSize: 12,
        marginLeft: 5
    },
    result: {
        color: 'white',
        fontSize: 14,
        padding: 5,
    },
    // popup section
    fullScreenContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    blurBackground: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    popupContainer: {
        width: 350,
        height: "max-content",
        paddingBottom: 24,
        backgroundColor: "#151515",
        opacity: 1,
        borderRadius: 12,
        borderColor: "white",
        borderWidth: 1,
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        alignSelf: "center",
        position: "absolute",
        top: 180,
        left: 20,
    },
    samerow: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        alignSelf: "center"
    },
    ta2: {
        color: "white",
        textTransform: "uppercase",
        fontFamily: 'OpenSans-Bold',
        textAlign: "center",
        fontSize: 22,
        marginTop: 12,
        letterSpacing: 1,
    },
    dp2: {
        width: 150,
        height: 170,
        borderRadius: 12,
        marginTop: 15,
        borderColor: "black",
        borderWidth: 1,
        alignSelf: "center"
    },
    into: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 100,
    },
    songInfoContainer: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#323232",
        width: "94%",
        alignSelf: "center",
        borderRadius: 6,
        borderColor: "#FF6500",
        borderWidth: 0,
        marginTop: 12,
        padding: 12
    },
    songText: {
        color: "white",
        fontFamily: "OpenSans-Bold",
        fontWeight: "800"
    },
    btn2: {
        height: 50,
        width: 145,
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1DB954",
        color: "white",
        borderRadius: 10,
        marginTop: "4%",
        alignSelf: "center"
    },
    btn22: {
        height: 50,
        width: 145,
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6500",
        color: "white",
        borderRadius: 10,
        marginTop: "4%",
        alignSelf: "center"
    },
    span: {
        color: "grey",
        fontFamily: "OpenSans-Bold",
        fontSize: 13
    },
    btntext2: {
        fontSize: 12,
        color: "#",
        fontFamily: "OpenSans-Bold",
        fontWeight: "700",
        position: "relative",
        bottom: 0
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
        height: 60,
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
        position: "relative",
        bottom: 6,
        alignSelf: "center",
        fontFamily: "OpenSans-Italic"
    },
    //reviews section
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
    col1: {
        display: "flex",
        flexDirection: "column",
        marginLeft: 0,
        paddingHorizontal: 12,
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
})