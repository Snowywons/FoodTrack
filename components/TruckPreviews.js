import React, {useState, useReducer, useContext, useEffect, createContext, i18nManager} from 'react';
import {StyleSheet, Text, View, Image, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from "@react-navigation/native";
import StateContext from './Context';
import i18n from "i18n-js";

const Preview = (props) => {
	let truck = props.data;
	return (
		<View style={styles.detailsContainers}>
			<Image source={{uri: truck.img}} style={{width: 200, height: 100}}/>
			<Text>{i18n.t("name")}: {truck.name}</Text>
			<Text>{i18n.t("style")}: {truck.type}</Text>
		</View>
	);
};

const TruckPreviews = (props) => {
	const navigation = useNavigation();
	const {state, dispatch} = useContext(StateContext);

	try {
		const trucks = props.data;

		let table = [];
		trucks.forEach(obj => {
			if (state.isShown) { //Todo: A repenser -> système FAVORIS

				let exists = false;
				state.favorites.forEach(f => {
					if (f.id === obj.id)
						exists = true;
				});

				if (exists) {
					table.push({
						id: obj.id,
						preview: <Preview data={obj}/>
					});
				}
			} else {
				table.push({
					id: obj.id,
					preview: <Preview data={obj}/>
				});
			}
		});

		return (
			<FlatList style={styles.list} contentContainerStyle={{paddingBottom: 80}}
					  data={table}
					  keyExtractor={(item) => item.id.toString()}
					  renderItem={({item}) => {
						  return (
							  <TouchableOpacity
								  style={styles.resetContainer}
								  onPress={() => {
									  navigation.navigate('Details', {truckId: item.id});
								  }}>
								  {item.preview}
							  </TouchableOpacity>)
					  }}
			/>
		);
	} catch (error) {
		return <View><Text>No results</Text></View>;
	}
};

const styles = StyleSheet.create({
	list: {
		width: "100%"
	},
	detailsContainers: {
		width: "100%",
		flex: 1,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "black"
	},
});
export default TruckPreviews