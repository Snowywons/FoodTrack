import {Button, StyleSheet, Text, TextInput, TouchableOpacity, View, I18nManager} from "react-native";
import React, {useState} from "react";
import i18n from "i18n-js";


const InputBar = (props) => {
	const api = "http://foodtrack-420kbc.herokuapp.com/trucks";
	const [text, setText] = useState("");


	return (
		<View>
			<TextInput style={styles.inputBar}
					   onChangeText={(txt) => {
						   setText(txt)
					   }}
					   value={text}
					   placeholder={i18n.t("name")}/>

			<View style={styles.buttonsContainer}>
				<TouchableOpacity style={styles.resetContainer} onPress={() => {
					setText("");
					props.onConfirm(api);
				}}>
					<Text style={styles.resetText}>{i18n.t("reset")}</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.confirmContainer} onPress={() => {
					let trimed = text.trim();
					if (trimed !== "")
						props.onConfirm(api + "/search?q=" + trimed);
					else
						props.onConfirm(api);
				}}>
					<Text style={styles.confirmText}>{i18n.t("confirm")}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	inputBar: {
		width: '100%',
		height: 35,
		backgroundColor: 'rgba(255,255,0,0.22)'
	},
	buttonsContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "flex-start",
		paddingTop: 5,
		paddingBottom: 5
	},
	resetContainer: {
		marginRight: 5,
		width: '40%',
		flex: 1,
		backgroundColor: 'red',
		color: 'white',
		textAlign: 'center',
		justifyContent: 'center',
		height: 30,
	},
	confirmContainer: {
		width: '40%',
		flex: 1,
		backgroundColor: 'gold',
		color: 'white',
		textAlign: 'center',
		justifyContent: 'center',
		height: 30,
	},
	confirmText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center'
	},
	resetText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center'
	},
});

export default InputBar;