/**
 * 路由配置
 */
import React, { Component, PureComponent } from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
    Text,
    Image,
    Animated,
    Easing,
} from 'react-native';

import {
    createStackNavigator,
    createBottomTabNavigator,
    createAppContainer,
} from 'react-navigation';
import Icon from 'react-native-vector-icons/Feather';

import VideoListScreen from './screen/VideoListScreen';
import VideoPlayScreen from './screen/VideoPlayScreen';
import FullScreenPlayer from "./screen/FullScreenPlayer";

const { width, height } = Dimensions.get('window');

// 首页底部Tab
const IndexScreen = createBottomTabNavigator(
    {
        Mode1: VideoListScreen,
        Mode2: VideoListScreen,
    },
    {
        tabBarOptions: {
            activeTintColor: '#4A90FA',
            inactiveTintColor: '#777',
            style: {
                backgroundColor: '#fff',
            },
        },
        defaultNavigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ focused, tintColor }) => {
                const { routeName } = navigation.state;
                let iconName;
                if (routeName === 'Mode1') {
                    iconName = 'list';
                } else {
                    iconName = 'maximize';
                }

                return <Icon name={iconName} size={24} color={focused ? '#707ee2' : '#888888'} />;
            },
            tabBarLabel: ({ focused, tintColor }) => {
                const { routeName } = navigation.state;
                let title;
                if (routeName === 'Mode1') {
                    title = '列表模式';
                } else {
                    title = '全屏模式';
                }

                return <Text style={{ fontSize: 12, textAlign: 'center', color: tintColor, marginBottom: 3 }}>{title}</Text>;
            },
        }),
    }
);
// 隐藏首页底部Tab的header
IndexScreen.defaultNavigationOptions = {
    header: null,
};

// 路由
export default createAppContainer(
    createStackNavigator(
        {
            Index: IndexScreen,
            VideoPlay: VideoPlayScreen,
            FullPlayer: FullScreenPlayer,
        },
        {
            initialRouteName: 'Index',
            headerMode: 'screen',
            defaultNavigationOptions: {
                header: null,
            },
            // 页面切换动画
            transitionConfig: () => ({
                transitionSpec: {
                    duration: 300,
                    easing: Easing.out(Easing.poly(4)),
                    timing: Animated.timing,
                },
                screenInterpolator: sceneProps => {
                    const { layout, position, scene } = sceneProps;
                    const { index } = scene;

                    const width = layout.initWidth;
                    const translateX = position.interpolate({
                        inputRange: [index - 1, index, index + 1],
                        outputRange: [width, 0, 0],
                    });

                    const opacity = position.interpolate({
                        inputRange: [index - 1, index - 0.99, index],
                        outputRange: [0, 1, 1],
                    });

                    return { opacity, transform: [{ translateX }] };
                },
            }),
        }
    ));
