import React, {useState, useReducer, useContext, useEffect, createContext} from 'react';
import {
	StyleSheet,
	View,
	FlatList,
	Text,
	TextInput,
	Dimensions,
	Button,
	ActivityIndicator,
	TouchableOpacity,
	I18nManager
} from 'react-native';
import MapView, {Polygon, Polyline, Marker} from 'react-native-maps';
import i18n from 'i18n-js';

import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Header from './components/Header';
import InputBar from './components/InputBar';
import TruckPreviews from './components/TruckPreviews';
import TruckDetails from './components/TruckDetails';
import StateContext from './components/Context';
import DB from './components/DAL';

const db = new DB();

const initialState = {
	isShown: false,
	favorites: [],
	currentMapPosition: {
		latitude: 45.50546113926367,
		latitudeDelta: 0.65,
		longitude: -73.70574040059736,
		longitudeDelta: 0.65
	}, 
	localeChanged:false
};
i18n.locale = "fr-CA";
i18n.translations["fr-CA"] ={
	"trucks":"Camions",
	"hideFave":"Cacher les favoris",
	"showFave":"Afficher les favoris",
	"search":"Recherche",
	"details":"Détails",
	"map":"Carte",
	"back":"Retour",
	"name":"Nom",
	"style":"Style",
	"confirm":"Confirmer",
	"reset":"Réinitialiser",
	"description":"Description",
	"price": "Prix",
	"lang":"EN"
}
i18n.translations["en-CA"]={
	"trucks":"Trucks",
	"hideFave":"Hide favorites",
	"showFave":"Show favorites",
	"search":"Search",
	"details":"Details",
	"map":"Map",
	"back":"Back",
	"name":"Name",
	"style":"Style",
	"confirm":"Confirm",
	"reset":"Reset",
	"description":"Description",
	"price":"Price",
	"lang":"FR"
}
const reducer = (state, action) => {
	switch (action.type) {
		case "initialStateUpdate" :
			let table = [];
			let length = action.data.length;

			for (let i = 0; i < length; i++) {
				table.push(action.data.item(i));
				console.log(action.data.item(i));
			}

			table.reverse();

			return {...state, favorites: table};

		case "add" : {
			let id = action.data.id;
			let name = action.data.name;
			let favorite = {
				id: id,
				name: name
			};

			db.insertTable([id, name]);
			return {...state, favorites: [favorite, ...state.favorites]};
		}

		case "delete" : {
			let id = action.data.id;
			let name = action.data.name;
			let table = [...state.favorites];
			let newTable = [];

			for (let i = 0; i < table.length; i++)
				if (table[i].id !== action.data.id)
					newTable.push(table[i]);

			db.deleteTable([id, name]);
			return {...state, favorites: newTable};
		}

		case "toggle" :
			let isShown = !state.isShown;
			return {...state, isShown: isShown};

		case "mapPosition" :
			return {...state, currentMapPosition: action.data};
			
		case "toggleLang" :
			return {...state, localeChanged: !state.localeChanged};

		default:
			throw new Error(`Action type: ${action.type} is not handled`);
	}
};

//Recherche de camions avec ou sans mot-clés
function Search({navigation, route}) {
	const {state, dispatch} = useContext(StateContext);
	const [results, setResults] = useState({});
	const [isFetching, setIsFetching] = useState(false);
	const [localeChanged, setLocaleChanged] = useState(false);

	let favoriteTitle = state.isShown ? i18n.t("hideFave"): i18n.t("showFave");

	let content;

	if (isFetching) {
		content =
			<View style={styles.container}>
				<View style={styles.activityIndicatorContainer}>
					<ActivityIndicator animated={true} size="large" color="red"/>
				</View>
			</View>;
	} else {
		content =
			<View style={styles.container}>
				<TruckPreviews data={results}/>
			</View>
	}

	const fetchData = (request) => {
		setIsFetching(true);

		fetch(request.trim().toLowerCase())
			.then(response => response.json())
			.then(jsonData => {
				setResults(jsonData);
			})
			.catch(error => {
				setResults(error.toString());
			}).finally(() => {
			setIsFetching(false);
		});
	};

	useEffect(() => {
		fetchData("http://foodtrack-420kbc.herokuapp.com/trucks");
	}, []);

	return (
		<View style={styles.appContainer}>
			<Header style={styles.headerContainer} title={i18n.t("trucks")}/>
			<InputBar onConfirm={(api) => fetchData(api)}/>

			{content}

			<Button onPress={() => {
				console.log(state.favorites);
				dispatch({type: "toggle"})
			}} title={favoriteTitle}/>
		</View>
	);
}

//Détails d'un camion selon un id
function Details({navigation, route}) {
	const ctx = useContext(StateContext);
	const [results, setResults] = useState(null);
	const [isFetching, setIsFetching] = useState(false);
	const {truckId} = route.params;

	let corps;

	if (isFetching) {
		corps =
			<View style={styles.container}>
				<View style={styles.activityIndicatorContainer}>
					<ActivityIndicator animated={true} size="large" color="red"/>
				</View>
			</View>;
	} else {
		corps =
			<View style={styles.container}>
				<TruckDetails data={results}/>
			</View>
	}

	const fetchData = (request) => {
		setIsFetching(true);
		let temp = [];

		//Fetch des informations du camion
		fetch(request.trim().toLowerCase())
			.then(response => response.json())
			.then(jsonData => {
				temp.push(jsonData);
			})
			.catch(error => {
				setResults(error.toString());
			}).finally(() => {

			//Fetch de la position du camion
			fetch(request.trim().toLowerCase() + "/position")
				.then(response => response.json())
				.then(jsonData => {
					temp.push(jsonData);
					setResults(temp);
				})
				.catch(error => {
					setResults(error.toString());
				}).finally(() => {
				setIsFetching(false);
			});
		});
	};

	useEffect(() => {
		fetchData("http://foodtrack-420kbc.herokuapp.com/trucks/" + truckId);
	}, []);

	return (
		<View style={styles.appContainer}>
			{corps}
		</View>
	);
}

//Recherche de camions selon une carte
function Map() {
	const {state, dispatch} = useContext(StateContext);
	const [results, setResults] = useState(undefined);
	const [isFetching, setIsFetching] = useState(false);

	let corps = <View></View>;

	if (isFetching) {
		corps = <View></View>;
	} else {
		if (results) {
			corps = results.map((obj) => (
				<MapView.Marker
					key={obj.id}
					title={obj.name}
					coordinate={{
					latitude: obj.coordinate.latitude,
					longitude: obj.coordinate.longitude
				}}></MapView.Marker>
			));
		}
	}

	const fetchData = (request) => {
		setIsFetching(true);

		//Fetch des informations du camion
		fetch(request)
			.then(response => response.json())
			.then(jsonData => {
				setResults(jsonData);
			})
			.catch(error => {
				setResults("NON");
			}).finally(() => {
			setIsFetching(false);
		});
	};

	useEffect(() => {
		fetchData("http://foodtrack-420kbc.herokuapp.com/trucks/map?" +
			"latitude=" + state.currentMapPosition.latitude +
			"&latitudeDelta=" + state.currentMapPosition.latitudeDelta +
			"&longitude=" + state.currentMapPosition.longitude +
			"&longitudeDelta=" + state.currentMapPosition.longitudeDelta);
	}, [state.currentMapPosition]);

	return (
		<View>
			<MapView initialRegion={state.currentMapPosition}
					 onRegionChangeComplete={(region) => {
						 dispatch({type: "mapPosition", data: region})
					 }}
					 style={styles.mapStyle}>
				{corps}
			</MapView>
		</View>
	);
}

const Stack = createStackNavigator();

export default function App() {
	const [state, dispatch] = useReducer(reducer, initialState);


	const initialStateUpdate = () => {
		db.db.transaction(tx => {
			tx.executeSql("SELECT * FROM Favorites", [], (_, result) => {
				if (result.rows.length > 0) {
					dispatch({type: "initialStateUpdate", data: result.rows});
				}
			});
		});
	};

	useEffect(() => {
		db.createTable();
		initialStateUpdate();
		// db.dropTable(["Favorites"]);
	}, []);

	return (
		<View style={styles.appContainer}>
			<StateContext.Provider value={{state, dispatch}}>
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Search">
						<Stack.Screen name="Search"
									  component={Search}
									  options={({navigation, route}) => ({
										  headerTitle: i18n.t("search"),
										  headerRight: () => <Button onPress={() => navigation.navigate('Map')}
																	 title={i18n.t("map")}/>
									  })}/>
						<Stack.Screen name="Details"
									  component={Details}
									  options={({navigation, route}) => ({
										  headerTitle: i18n.t("details"),
										  headerLeft: () => <Button onPress={() => navigation.navigate('Search')}
																	title={i18n.t("back")}/>
									  })}/>
						<Stack.Screen name="Map"
									  component={Map}
									  options={({navigation, route}) => ({
										  headerTitle: i18n.t("map"),
										  headerLeft: () => <Button onPress={() => navigation.navigate('Search')}
																	title={i18n.t("back")}/>
									  })}/>
					</Stack.Navigator>
				</NavigationContainer>
			</StateContext.Provider>
		</View>
	);
}

const styles = StyleSheet.create({
	appContainer: {
		flex: 1
	},
	container: {
		width: "100%",
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerContainer: {},
	activityIndicatorContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	mapStyle: {
		width: "100%",
		height: "100%"
	},
});
