import React from 'react';
import { View, ScrollView, Text, Image, BackHandler, TouchableHighlight } from 'react-native';
import VideoPlayer, { defaultVideoHeight, isSystemIOS, statusBarHeight } from "../components/VideoPlayer";
import Orientation from "react-native-orientation";
import { videoList, styles } from "./VideoListScreen";

export default class VideoPlayScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFullScreen: false,
            currentUrl: this.props.navigation.state.params.url,
            videoHeight: defaultVideoHeight
        };
        BackHandler.addEventListener('hardwareBackPress', this._backButtonPress);
        Orientation.addOrientationListener(this._orientationDidChange);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this._backButtonPress);
        Orientation.removeOrientationListener(this._orientationDidChange);
    }

    render() {
        let statusBarView = null;
        let videoTopHeight = 0;
        if (isSystemIOS) {
            statusBarView =
                (<View style={[{ backgroundColor: '#000' }, this.state.isFullScreen ? { height: 0 } : { height: statusBarHeight }]} />);
            videoTopHeight = this.state.isFullScreen ? 0 : statusBarHeight;
        }

        return (
            <View style={styles.container} onLayout={this._onLayoutChange}>
                {statusBarView}
                <VideoPlayer
                    ref={(ref) => this.videoPlayer = ref}
                    style={{ top: videoTopHeight }}
                    isShowBackIcon={true}
                    videoURL={this.state.currentUrl}
                    videoTitle={'视频标题'}
                    videoCover={'http://img2.kfcdn.com/isy/upload/evaluate/20151127/jz19nnr06nzsa53q.jpg'}
                    onTapBackButton={this._onClickBackButton}
                />
                <ScrollView style={[styles.container, { marginTop: this.state.videoHeight }]}>
                    {
                        videoList.map((item, index) => {
                            let isSelected = (this.state.currentUrl === item);
                            return (
                                <TouchableHighlight key={index} underlayColor={'#dcdcdc'} onPress={() => { this.itemSelected(item) }}>
                                    <View style={styles.itemContainer}>
                                        <Text style={[styles.title, isSelected ? styles.title_active : null]}>视频{index + 1}</Text>
                                        <Image source={require('../image/icon_right.png')} style={styles.rightIcon} />
                                    </View>
                                </TouchableHighlight>
                            )
                        })
                    }
                </ScrollView>
            </View>
        );
    }

    /// 处理安卓物理返回键，横屏时点击返回键回到竖屏，再次点击回到上个界面
    _backButtonPress = () => {
        if (this.state.isFullScreen) {
            Orientation.lockToPortrait();
        } else {
            this.props.navigation.goBack();
        }
        return true;
    };

    _onClickBackButton = () => {
        this.props.navigation.goBack();
    };

    _onLayoutChange = (event) => {
        let { x, y, width, height } = event.nativeEvent.layout;
        let isLandscape = (width > height);
        if (isLandscape) {
            this.setState({
                isFullScreen: true,
                videoHeight: height
            });
            this.videoPlayer.updateLayout(width, height, true);
        } else {
            this.setState({
                isFullScreen: false,
                videoHeight: width * 9 / 16
            });
            this.videoPlayer.updateLayout(width, width * 9 / 16, false);
        }
        // Orientation.unlockAllOrientations();
    };

    _orientationDidChange = (orientation) => {
        if (orientation === 'PORTRAIT') {

        } else {

        }
    };

    itemSelected(url) {
        this.setState({
            currentUrl: url
        });
        this.videoPlayer.updateVideo(url, 0, null);
    };
}
