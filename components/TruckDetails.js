import React, {useState, useReducer, useContext, useEffect, createContext} from 'react';
import {StyleSheet, Text, View, Image, FlatList, Button, TouchableOpacity, I18nManager} from 'react-native';
import MapView, {Polygon, Polyline, Marker} from 'react-native-maps';
import StateContext from './Context';
import Header from "./Header";
import i18n from "i18n-js";

const Preview = (props) => {
	let truck = props.data;
	return (
		<View style={styles.detailsContainers}>
			<Image source={{uri: truck.img}} style={{width: 200, height: 100}}/>
			<Text>{i18n.t("name")} {truck.name}</Text>
			<Text>{i18n.t("style")}{truck.type}</Text>
		</View>
	);
};
const TruckDetails = (props) => {
	const {state, dispatch} = useContext(StateContext);

	try {
		let truck = props.data[0];
		let position = props.data[1];

		//Add s'il n'est pas en favoris, delete si oui
		let actionType = "add";
		state.favorites.forEach((el) => {
			if (el.id === truck.id)
				actionType = "delete";
		});

		//
		let uri = actionType === "add" ?
			"https://icons-for-free.com/iconfiles/png/512/favorite+favourite+premium+rate+rating+star+icon-1320166547676710135.png" :
			"https://icons.iconarchive.com/icons/hopstarter/soft-scraps/256/Button-Favorite-icon.png";

		let id = 0;
		let table = [];
		truck.menu.forEach((obj) => {
			table.push({
				id: id++,
				description: obj.description,
				name: obj.name,
				price: obj.price
			});
		});

		return (
			<View style={styles.container}>
				<Header style={styles.headerContainer} title={truck.name}/>
				<View style={styles.header}>
					<Image source={{uri: truck.img}} style={{width: 200, height: 100}}/>
					<TouchableOpacity
						onPress={() => dispatch({type: actionType, data: truck})}>
						<Image
							source={{uri: uri}}
							style={{width: 50, height: 50}}/>
					</TouchableOpacity>
				</View>
				<Text style={styles.title}>Menu</Text>
				<FlatList contentContainerStyle={{paddingBottom: 80}}
						  data={table}
						  keyExtractor={(item) => item.id.toString()}
						  renderItem={({item}) => {
							  return (
								  <View style={styles.textContainer}>
									  <Text style={styles.label}>{i18n.t("name")}: </Text><Text>{item.name}</Text>
									  <Text style={styles.label}>{i18n.t("description")}: </Text><Text>{item.description}</Text>
									  <Text style={styles.label}>{i18n.t("price")}: </Text><Text>{item.price} $</Text>
								  </View>
							  )
						  }}
				/>
				<MapView initialRegion={{
					latitude: position[1],
					latitudeDelta: 0.07,
					longitude: position[0],
					longitudeDelta: 0.07
				}} style={styles.mapStyle}>
					<Marker title={truck.name} coordinate={{latitude: position[1], longitude: position[0]}}></Marker>
				</MapView>
			</View>
		);
	} catch (error) {
		return <View><Text>{error.toString()}</Text></View>;
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%"
	},
	header: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: 'space-evenly'
	},
	mapStyle: {
		width: "100%",
		height: 250,
	},
	title: {
		fontWeight: "bold"
	},
	label: {
		fontStyle: "italic"
	},
	textContainer: {
		borderBottomWidth: 1,
		borderStyle: "solid",
		borderColor: "black",
		padding: 5
	}
});
export default TruckDetails