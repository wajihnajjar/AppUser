import React, { Component } from "react";
import axios from "axios";
// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from "react-native-google-signin";
import {
  Text,
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  BackHandler,
  Animated,
} from "react-native";
import { withNavigation } from "react-navigation";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Sizes, Fonts } from "../../constants/styles";
import * as Google from "expo-google-app-auth";
import * as Facebook from "expo-facebook";
import { NavigationEvents } from "react-navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("screen");

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.springValue = new Animated.Value(100);
  }

  componentDidMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButton.bind(this)
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButton.bind(this)
    );
  }

  handleBackButton = () => {
    this.state.backClickCount == 1 ? BackHandler.exitApp() : this._spring();
    return true;
  };

  _spring() {
    this.setState({ backClickCount: 1 }, () => {
      Animated.sequence([
        Animated.spring(this.springValue, {
          toValue: -0.05 * height,
          friction: 5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(this.springValue, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        this.setState({ backClickCount: 0 });
      });
    });
  }

  state = {
    phoneNumber: "",
    backClickCount: 0,
    email: "",
    password: "",
    familyName: "",
    givenName: "",
    name: "",
    photoUrl: "",
  };

  login() {
    axios
      .post("http://192.168.159.22:5000/user/login", {
        email: this.state.email,
        password: this.state.password,
      })
      .then((res) => {
        console.log(res.data);
        console.log(res.data.msg, "im her ");
        if (res.data.msg === "Logged in!") {
          console.log(res.data.msg, "im her ");
          this.props.navigation.navigate("Home");

          // this.setState({isLoading:false})
          // this.props.navigation.navigate("Home");
          let storeData = async () => {
            try {
              await AsyncStorage.setItem(
                "user",
                JSON.stringify(res.data.token)
              );
            } catch (error) {
              // Error saving data
              console.log(error);
            }
          };
          storeData();
        } else if (res.data.msg !== "Logged in!") {
          alert("Username or password is incorrect!");
        }
      })
      .catch((err) => console.log(err));
  }
  async signInWithGoogleAsync() {
    try {
      const result = await Google.logInAsync({
        // androidClientId: YOUR_CLIENT_ID_HERE,
        iosClientId:
          "1095208632020-mtvauv1bv63mttq3ist9plidqfcu938n.apps.googleusercontent.com",
        scopes: ["profile", "email"],
      });
      console.log(result.user);

      if (result.type === "success") {
        console.log(result.accessToken);
        axios
          .post("http://192.168.159.22:5000/user/googleSignIn", {
            email: result.user.email,
            username: result.user.name,
            photoUrl: result.user.photoUrl,
          })
          .then((res) => {
            console.log(res, "response");
          })
          .catch((err) => {
            console.log(err, "error");
          });
      } else {
        console.log("cancelled");
      }
    } catch (e) {
      console.log("error", e);
    }
  }

  async fbLogin() {
    try {
      await Facebook.initializeAsync({
        appId: "1979313035585850",
      });
      const { type, token, expirationDate, permissions, declinedPermissions } =
        await Facebook.logInWithReadPermissionsAsync({
          permissions: ["public_profile"],
        });
      if (type === "success") {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${token}`
        );
        alert("Logged in!", `Hi ${(await response.json()).name}!`);
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor="rgba(0,0,0,0)" />
        <NavigationEvents
          onDidFocus={() => {
            BackHandler.addEventListener(
              "hardwareBackPress",
              this.handleBackButton.bind(this)
            );
          }}
        />
        <ImageBackground
          style={{ flex: 1 }}
          source={require("../../assets/images/bg.jpg")}
          resizeMode="cover"
        >
          <LinearGradient
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            colors={["black", "rgba(0,0.10,0,0.70)", "rgba(0,0,0,0.0)"]}
            style={{ flex: 1, paddingHorizontal: Sizes.fixPadding * 2.0 }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {this.welcomeInfo()}
              {this.EmailTextField()}
              {this.PasswordTextField()}
              {this.continueButton()}
              {this.registerButton()}
              {this.loginWithFacebookButton()}
              {this.loginWithGoogleButton()}
            </ScrollView>
          </LinearGradient>
        </ImageBackground>
        <Animated.View
          style={[
            styles.animatedView,
            { transform: [{ translateY: this.springValue }] },
          ]}
        >
          <Text style={{ ...Fonts.whiteColor14Medium }}>
            press back again to exit the app
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  EmailTextField() {
    return (
      <TextInput
        value={this.state.email}
        onChange={() => {
          this.state.email;
          console.log(this.state.email);
        }}
        defaultCountry="IN"
        onChangeText={(email) => this.setState({ email })}
        style={styles.textFieldWrapStyle}
        placeholder="Email..."
        placeholderTextColor="white"
        dialCodeTextStyle={{
          ...Fonts.whiteColor14Medium,
          marginLeft: Sizes.fixPadding,
        }}
        containerStyle={{
          backgroundColor: "rgba(203, 189, 189, 0.73)",
          borderRadius: Sizes.fixPadding * 2.0,
          height: 56.0,
          marginTop: Sizes.fixPadding * 1.0,
        }}
      />
    );
  }
  PasswordTextField() {
    return (
      <TextInput
        value={this.state.password}
        onChange={() => {
          this.state.password;
          console.log(this.state.password);
        }}
        defaultCountry="IN"
        onChangeText={(password) => this.setState({ password })}
        style={styles.textFieldWrapStyle}
        placeholder="Password..."
        placeholderTextColor="white"
        secureTextEntry={true}
        dialCodeTextStyle={{
          ...Fonts.whiteColor14Medium,
          marginLeft: Sizes.fixPadding,
        }}
        containerStyle={{
          backgroundColor: "rgba(203, 189, 189, 0.73)",
          borderRadius: Sizes.fixPadding * 2.0,
          height: 56.0,
          marginTop: Sizes.fixPadding * 1.0,
        }}
      />
    );
  }

  loginWithGoogleButton() {
    return (
      <View style={styles.loginWithGoogleButtonStyle}>
        <Image
          source={require("../../assets/images/google.png")}
          style={{ height: 37.0, width: 37.0 }}
          resizeMode="cover"
        />
        <Text
          onPress={this.signInWithGoogleAsync}
          style={{
            ...Fonts.blackColor14Medium,
            marginLeft: Sizes.fixPadding + 5.0,
          }}
        >
          Log in with Google
        </Text>
      </View>
    );
  }

  loginWithFacebookButton() {
    return (
      <View style={styles.loginWithFacebookButtonStyle}>
        <Image
          source={require("../../assets/images/facebook.png")}
          style={{ height: 37.0, width: 37.0 }}
          resizeMode="cover"
        />
        <Text
          onPress={this.fbLogin}
          style={{
            ...Fonts.whiteColor14Medium,
            marginLeft: Sizes.fixPadding + 5.0,
          }}
        >
          Log in with Facebook
        </Text>
      </View>
    );
  }

  otpText() {
    return (
      <Text style={{ ...Fonts.whiteColor18Medium, textAlign: "center" }}>
        We’ll send otp for verification
      </Text>
    );
  }

  continueButton() {
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={ async () => {
          if (!this.state.email || !this.state.password) {
            alert("put all info");
            this.props.navigation.navigate("Home");
          } else {
            if (this.state.email.indexOf("@") == -1) {
              alert("email must be correct");
            } else if (format.test(this.state.password) !== true) {
              alert("Password must includes Uppercase and Symboles");
            } else {
   axios.post("http://192.168.159.22:5000/user/getIdUser"  , {
email : this.state.email 
   }) . then( async (res)=> { 
  await AsyncStorage.setItem("user_id" , res.data[0].user_id.toString())
   } )
              this.login();
            }
          }
        }}
      >
        <LinearGradient
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          colors={["rgba(253, 153, 2,1.2)", "rgba(253, 153, 2, 0.49)"]}
          style={styles.continueButtonStyle}
        >
          <Text style={{ ...Fonts.whiteColor18Bold }}>Login</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  registerButton() {
    return (   
          <Text  style={{ ...Fonts.whiteColor18Medium, textAlign: "center" }} 
        onPress={() => {
          this.props.navigation.navigate("Register");
        }}
        >Register</Text>
      
    );
  }

  welcomeInfo() {
    return (
      <View
        style={{
          marginTop: Sizes.fixPadding * 8.0,
          marginBottom: Sizes.fixPadding * 4.0,
        }}
      >
        <Text style={{ ...Fonts.whiteColor36Bold }}></Text>
      
      </View>
    );
  }
}

const styles = StyleSheet.create({
  registerButton:{
    alignItems: "center",
    justifyContent: "center",
  },
  textFieldWrapStyle: {
    alignItems: "center",
    justifyContent: "center",
    height: 60.0,
    paddingHorizontal: Sizes.fixPadding * 2.0,
    backgroundColor: "rgba(203, 189, 189, 0.73)",
    borderRadius: Sizes.fixPadding * 2.0,
    marginBottom: Sizes.fixPadding * 2.5,
    ...Fonts.whiteColor14Medium,
  },
  selectAreaModalStyle: {
    height: height * 0.5,
    width: width * 0.8,
    backgroundColor: Colors.whiteColor,
    borderRadius: Sizes.fixPadding,
  },
  loginWithGoogleButtonStyle: {
    borderRadius: Sizes.fixPadding * 2.0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.whiteColor,
    flexDirection: "row",
    height: 56.0,
    marginBottom: Sizes.fixPadding * 2.0,
  },
  loginWithFacebookButtonStyle: {
    borderRadius: Sizes.fixPadding * 2.0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Sizes.fixPadding * 6.0,
    marginBottom: Sizes.fixPadding * 2.5,
    backgroundColor: "#3B5998",
    flexDirection: "row",
    height: 56.0,
  },
  continueButtonStyle: {
    borderRadius: Sizes.fixPadding * 2.0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Sizes.fixPadding * 0.0,
    marginBottom: Sizes.fixPadding * 2.0,
    height: 54.0,
  },
  searchCountryTextFieldContentStyle: {
    marginHorizontal: Sizes.fixPadding * 2.0,
    marginTop: Sizes.fixPadding * 2.0,
    borderBottomWidth: 1.0,
    borderBottomColor: Colors.grayColor,
  },
  animatedView: {
    backgroundColor: "#333333",
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    borderRadius: Sizes.fixPadding + 5.0,
    paddingHorizontal: Sizes.fixPadding + 5.0,
    paddingVertical: Sizes.fixPadding,
    justifyContent: "center",
    alignItems: "center",
  },
});

LoginScreen.navigationOptions = () => {
  return {
    header: () => null,
  };
};

export default withNavigation(LoginScreen);
