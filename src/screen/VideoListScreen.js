import React from 'react';
import { FlatList, View, Text, Image, TouchableHighlight, StyleSheet } from 'react-native';
import Orientation from "react-native-orientation";
import { statusBarHeight } from "../components/VideoPlayer";

export const videoList = [
    "http://wvideo.spriteapp.cn/video/2016/0328/56f8ec01d9bfe_wpd.mp4", "http://flv2.bn.netease.com/videolib3/1609/12/aOzvT5225/HD/movie_index.m3u8",
    "https://www3.yuboyun.com/hls/2018/11/12/nmzTXY6D/playlist.m3u8",
    "http://v.zhubodasai.com/v2/m_20181030_4690/1/d104cd51ca787c02b4ceaf084801ace4_free.m3u8",
];

export default class VideoListScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        headerTitle: (navigation.state.routeName === 'Mode1') ? '列表模式' : '全屏模式',
    });

    constructor(props) {
        super(props);
        // 锁定纵向
        Orientation.lockToPortrait();
    }

    render() {
        return (
            <FlatList
                data={videoList}
                renderItem={this._renderRow}
                keyExtractor={(item) => item}
            />
        )
    }

    _renderRow = (item) => {
        let url = item.item;

        return (
            <TouchableHighlight underlayColor={'#dcdcdc'} onPress={() => { this.itemSelected(url) }}>
                <View style={styles.itemContainer}>
                    <Text style={styles.title}>视频{item.index + 1}.{url.substr(url.lastIndexOf('.') + 1)}</Text>
                    <Image source={require('../image/icon_right.png')} style={styles.rightIcon} />
                </View>
            </TouchableHighlight>
        )
    };

    itemSelected(url) {
        if (this.props.navigation.state.routeName === 'Mode1') {
            this.props.navigation.navigate('VideoPlay', { url: url });
        } else {
            this.props.navigation.navigate('FullPlayer', { url: url });
        }
    }
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#dcdcdc'
    },
    title: {
        fontSize: 16,
        color: '#000',
        flex: 1
    },
    title_active: {
        color: '#00c08d'
    },
    rightIcon: {
        width: 15,
        height: 15
    },
    statusBarView: {
        backgroundColor: '#000',
        height: statusBarHeight,
    }
});
