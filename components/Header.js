import React, {useContext} from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity} from 'react-native';
import i18n from "i18n-js";
import StateContext from './Context';

const Header = (props) => {
	const {state, dispatch} = useContext(StateContext);
	return (
		<View style={styles.header}>
			<Text style={styles.title}>{ props.title }</Text>
			<TouchableOpacity style={styles.langButton} onPress={() => {
				if(i18n.locale === "fr-CA"){
					i18n.locale = "en-CA";
				}
				else{ 
					i18n.locale = "fr-CA";
			}
			dispatch({type:"toggleLang"});
			}}><Text style={{color:'white'}}>{i18n.t("lang")}</Text></TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	header:{
		backgroundColor: "#171717",
		height: 80,
		alignItems: 'center',
		justifyContent: 'center',
	},

	title:{
		color: "#F3F3F3",
		fontSize: 28,
		fontWeight: '900',
		textTransform: 'uppercase'
	},
	langButton:{
		fontSize:18,
		alignSelf:'flex-end',
		padding:10
	}
});

export default Header;