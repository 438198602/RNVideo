/**
 * 视频播放组件
 */
import React from 'react';
import {
    View,
    Text,
    Image,
    Slider,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    TouchableWithoutFeedback,
    DeviceInfo,
    Platform,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import Video from 'react-native-video';
import Orientation from "react-native-orientation";
import SelectDefinitionView from "./SelectDefinitionView";
import SelectVideoView from "./SelectVideoView";
import ShareOptionView from "./ShareOptionView";
import MoreSettingView from "./MoreSettingView";

const optionItems = ['蓝光', '超清', '高清', '标清'];

export default class VideoPlayer extends React.Component {
    static propTypes = {
        onTapBackButton: PropTypes.func,
    };

    static defaultProps = {
        videoWidth: screenWidth,  // 默认视频宽度，竖屏下为屏幕宽度
        videoHeight: defaultVideoHeight,  // 默认视频高度，竖屏下为宽度的9/16，使视频保持16：9的宽高比
        videoURL: '',  // 视频的地址
        videoCover: 'http://img2.kfcdn.com/isy/upload/evaluate/20151127/jz19nnr06nzsa53q.jpg',  // 视频的封面图地址
        videoTitle: '视频的标题',  // 视频的标题
        enableSwitchScreen: true,  // 是否允许视频切换大小
        repeat: false,  // 是否重复播放
        isShowBackIcon: false,  // 是否显示返回按钮
    };

    constructor(props) {
        super(props);
        let hasCover = true;
        if (this.props.videoCover == null || this.props.videoCover === '') {
            hasCover = false;
        }
        this.state = {
            x: 0,
            videoWidth: screenWidth,
            videoHeight: defaultVideoHeight,
            videoUrl: this.props.videoURL,
            videoCover: this.props.videoCover,
            videoTitle: this.props.videoTitle,
            repeat: this.props.repeat,
            hasCover: hasCover, // 是否有视频封面
            isShowVideoCover: hasCover, // 是否显示视频封面
            isShowVideoLoading: true, // 显示视频缓冲loading
            isPaused: true,  // 是否暂停，控制视频的播放和暂停
            duration: 0,     // 视频的时长
            currentTime: 0,  // 视屏当前播放的时间
            isFullScreen: false, // 是否全屏
            isShowControl: false, // 是否显示播放的工具栏
            playFromBeginning: false, // 视频是否需要从头开始播放
            isMuted: false,  // 是否静音
            volume: 1.0,   // 音量大小
            playRate: 1.0, // 播放速率
            lastSingleTapTime: 0,   //上次单点击视频区域的时间
            isDefinitionShow: false, // 是否显示清晰度切换界面
            definitionIndex: 0, // 清晰度
            isVideoListShow: false,  // 是否显示选集界面
            isShareMenuShow: false,  // 是否显示分享界面
            isSettingViewShow: false, // 是否显示设置界面
        }
    }

    componentDidMount() {
    }

    render() {
        const defaultStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: this.state.videoWidth,
            height: this.state.videoHeight,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
        };

        return (
            <View style={[defaultStyle, { backgroundColor: 'rgba(0,0,0,.2)' }, this.props.style]}>
                {/* 封面 */}
                {
                    this.state.hasCover && this.state.isShowVideoCover ?
                        <TouchableHighlight style={defaultStyle} onPress={this._playVideo}>
                            <Image
                                style={defaultStyle}
                                source={{ uri: this.state.videoCover }}
                            />
                        </TouchableHighlight> : null
                }
                {/* 视频缓冲显示Loading */}
                {
                    this.state.isShowVideoLoading && !this.state.isPaused ?
                        <View style={defaultStyle}>
                            <ActivityIndicator color="#77A9FD" size="large" />
                        </View> : null
                }
                {/* 视频 */}
                {
                    !this.state.isShowVideoCover ?
                        <Video
                            ref={(ref) => { this.videoRef = ref }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: this.state.x,
                                width: this.state.videoWidth - 2 * this.state.x,
                                height: this.state.videoHeight,
                            }}
                            source={{ uri: this.state.videoUrl }}
                            resizeMode="contain"
                            repeat={this.state.repeat}
                            rate={this.state.playRate}
                            volume={this.state.volume}
                            muted={this.state.isMuted}
                            ignoreSilentSwitch={"ignore"}
                            paused={this.state.isPaused}
                            onLoadStart={this._onLoadStart}
                            onBuffer={this._onBuffering}
                            onLoad={this._onLoad}
                            onProgress={this._onProgressChange}
                            onEnd={this._onPlayEnd}
                            onError={this._onPlayError}
                            playInBackground={false}
                            playWhenInactive={false}
                        /> : null
                }
                {/* 显示或隐藏控制栏 */}
                {
                    !this.state.isShowVideoCover ?
                        <TouchableWithoutFeedback onPress={this._onTapVideo}>
                            <View style={defaultStyle}></View>
                        </TouchableWithoutFeedback> : null
                }
                {/* 控制栏 */}
                {
                    this.state.isShowControl ?
                        <View style={[styles.bottomControl, { width: this.state.videoWidth }]}>
                            <Image
                                source={require('../image/img_bottom_shadow.png')}
                                style={[styles.bottomControl, { width: this.state.videoWidth }]}
                            />
                            <TouchableOpacity
                                activeOpacity={0.3}
                                style={[styles.bottomOptionItem, { marginLeft: this.state.isFullScreen ? 15 : 0 }]}
                                onPress={this._onTapPlayButton}
                            >
                                <Image
                                    style={styles.control_play_btn}
                                    source={this.state.isPaused ? require('../image/icon_control_play.png') : require('../image/icon_control_pause.png')}
                                />
                            </TouchableOpacity>
                            <Text style={styles.timeText}>{formatTime(this.state.currentTime)}</Text>
                            <Slider
                                style={{ flex: 1 }}
                                maximumTrackTintColor={'#999999'}  // 滑块右侧轨道的颜色
                                minimumTrackTintColor={'#00c06d'}  // 滑块左侧轨道的颜色
                                thumbImage={require('../image/icon_control_slider.png')}
                                value={this.state.currentTime}
                                minimumValue={0}
                                maximumValue={Number(this.state.duration)}
                                onValueChange={this._onSliderValueChange}
                            />
                            <Text style={styles.timeText}>{formatTime(this.state.duration)}</Text>
                            {
                                this.props.enableSwitchScreen ?
                                    <TouchableOpacity activeOpacity={0.3} style={styles.bottomOptionItem} onPress={this._onTapSwitchButton}>
                                        <Image
                                            style={styles.control_switch_btn}
                                            source={this.state.isFullScreen ? require('../image/icon_control_shrink_screen.png') : require('../image/icon_control_full_screen.png')}
                                        />
                                    </TouchableOpacity> : null
                            }
                            {
                                this.state.isFullScreen ?
                                    <View style={styles.bottomOptionView}>
                                        <TouchableOpacity style={styles.bottomOptionItem} onPress={this._onTapDefinitionButton}>
                                            <Text style={styles.bottomOptionText}>{optionItems[this.state.definitionIndex]}</Text>
                                        </TouchableOpacity>
                                        {/* <TouchableOpacity style={styles.bottomOptionItem} onPress={this._onTapSelectVideo}>
                                            <Text style={[styles.bottomOptionText, { marginLeft: 10 }]}>选集</Text>
                                        </TouchableOpacity> */}
                                    </View> : null
                            }
                        </View> : null
                }
                {/* 非全屏下的返回按钮 */}
                {
                    this.state.isFullScreen ?
                        null :
                        this.props.isShowBackIcon ?
                            <TouchableOpacity
                                style={[defaultStyle, { width: 44, height: 44 }]}
                                onPress={this._onTapBackButton}
                            >
                                <Image
                                    source={require('../image/icon_back.png')}
                                    style={{ width: 26, height: 26 }}
                                />
                            </TouchableOpacity> :
                            null
                }
                {/* 全屏下顶部控制栏 */}
                {
                    this.state.isFullScreen && this.state.isShowControl ?
                        <View style={[styles.topControl, { width: this.state.videoWidth }]}>
                            <Image
                                source={require('../image/img_top_shadow.png')}
                                style={[styles.bottomControl, { width: this.state.videoWidth }]}
                            />
                            <TouchableOpacity style={styles.backButton} onPress={this._onTapBackButton}>
                                <Image
                                    source={require('../image/icon_back.png')}
                                    style={{ width: 26, height: 26 }}
                                />
                            </TouchableOpacity>
                            <Text style={styles.videoTitle} numberOfLines={1}>{this.state.videoTitle}</Text>
                            {/* <View style={styles.topOptionView}>
                                <TouchableOpacity style={styles.topOptionItem} onPress={this._onTapCaptureImage}>
                                    <Image
                                        source={require('../image/icon_video_capture.png')}
                                        style={{ width: 26, height: 26 }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.topOptionItem} onPress={this._onTapAirplayButton}>
                                    <Image
                                        source={require('../image/icon_video_airplay.png')}
                                        style={styles.topImageOption}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.topOptionItem} onPress={this._onTapShareButton}>
                                    <Image
                                        source={require('../image/icon_video_share.png')}
                                        style={{ width: 22, height: 22 }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.topOptionItem} onPress={this._onTapMoreButton}>
                                    <Image
                                        source={require('../image/icon_video_more.png')}
                                        style={styles.topImageOption}
                                    />
                                </TouchableOpacity>
                            </View> */}
                        </View> :
                        null
                }
                {/* 播放暂停按钮 */}
                <TouchableHighlight
                    activeOpacity={1}
                    style={{
                        position: 'absolute',
                        top: this.state.videoHeight / 2 - 25,
                        left: this.state.videoWidth / 2 - 25,
                    }}
                    onPress={this._onTapPlayButton}
                >
                    {
                        this.state.isPaused ?
                            <Image
                                style={styles.playButton}
                                source={require('../image/icon_video_play.png')}
                            /> :
                            !this.state.isShowVideoLoading && this.state.isShowControl ?
                                <Image
                                    style={styles.playButton}
                                    source={require('../image/icon_video_pause.png')}
                                /> :
                                <View></View>
                    }
                </TouchableHighlight>
                {/* 清晰度切换 */}
                {
                    this.state.isFullScreen && this.state.isDefinitionShow ?
                        <SelectDefinitionView
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: this.state.videoWidth,
                                height: this.state.videoHeight,
                            }}
                            data={optionItems}
                            selectedIndex={this.state.definitionIndex}
                            onItemSelected={(index) => this.onDefinitionItemSelected(index)}
                            onCloseWindow={() => { this.setState({ isDefinitionShow: false }) }}
                        /> :
                        null
                }
                {/* 视频列表切换 */}
                {
                    this.state.isFullScreen && this.state.isVideoListShow ?
                        <SelectVideoView
                            currentUrl={this.state.videoUrl}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: this.state.videoWidth,
                                height: this.state.videoHeight,
                            }}
                            onItemSelected={(url) => this.onVideoListSwitch(url)}
                            onCloseWindow={() => { this.setState({ isVideoListShow: false }) }}
                        /> :
                        null
                }
                {/* 分享 */}
                {
                    this.state.isFullScreen && this.state.isShareMenuShow ?
                        <ShareOptionView
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: this.state.videoWidth,
                                height: this.state.videoHeight,
                            }}
                            onShareItemSelected={(index) => { this.onShareMenuPressed(index) }}
                            onCloseWindow={() => { this.setState({ isShareMenuShow: false }) }}
                        /> :
                        null
                }
                {/* 设置 */}
                {
                    this.state.isFullScreen && this.state.isSettingViewShow ?
                        <MoreSettingView
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: this.state.videoWidth,
                                height: this.state.videoHeight,
                            }}
                            isMuted={this.state.isMuted}
                            volume={this.state.volume}
                            selectedRate={this.state.playRate}
                            selectedEndTimeIndex={0}
                            onFavoriteTapped={() => { this.setState({ isSettingViewShow: false }) }}
                            onDownloadTapped={() => { this.setState({ isSettingViewShow: false }) }}
                            onMuteVolumeTapped={(isMute) => { this.onMuteVolume(isMute); }}
                            onPlayRateChanged={(rate) => { this.onPlayRateChange(rate); }}
                            onEndTimeSelected={(index) => { this.onEndTimeChange(index); }}
                            onCloseWindow={() => { this.setState({ isSettingViewShow: false }) }}
                            onVolumeChange={(volume) => { this.onVolumeChanged(volume); }}
                        /> :
                        null
                }
            </View>
        );
    }

    /// -------播放器回调事件方法-------
    _onLoadStart = () => {
        console.log('视频开始加载...');
        this.setState({
            isShowVideoLoading: true
        })
    };

    _onBuffering = () => {
        console.log('视频缓冲中...');
    };

    _onLoad = (data) => {
        console.log('视频加载完成');
        this.setState({
            isShowVideoLoading: false,
            duration: data.duration,
        });
    };

    //进度
    _onProgressChange = (data) => {
        if (!this.state.isPaused) {
            this.setState({
                currentTime: data.currentTime,
            })
        }
    };

    //视频播放结束触发的方法
    _onPlayEnd = () => {
        console.log('播放结束');
        this.setState({
            currentTime: 0,
            isPaused: true,
            playFromBeginning: true,
            isShowVideoCover: this.state.hasCover
        });
    };

    _onPlayError = () => {
        console.log('视频播放失败');
        this.setState({
            isShowVideoCover: true,
            isPaused: true
        })
    };

    /// -------控件点击事件-------
    // 点击返回键
    _onTapBackButton = () => {
        if (this.state.isFullScreen) {
            Orientation.lockToPortrait();
        } else {
            this.props.onTapBackButton && this.props.onTapBackButton();
        }
    };

    // 播放视频
    _playVideo = () => {
        this.setState({
            isShowVideoCover: false,
            isPaused: false
        })
    };

    // 显示或隐藏控制栏
    _onTapVideo = () => {
        let isShow = !this.state.isShowControl;
        this.setState({
            isShowControl: isShow,
        })
    };

    // 播放或暂停视频
    _onTapPlayButton = () => {
        let isPause = !this.state.isPaused;
        let isShowControl = false;
        if (!isPause) {
            isShowControl = true;
        }
        this.setState({
            isPaused: isPause,
            isShowControl: isShowControl,
            isShowVideoCover: false
        });
        if (this.state.playFromBeginning) {
            this.videoRef.seek(0);
            this.setState({
                playFromBeginning: false,
            })
        }
    };

    // 拖动播放进度
    _onSliderValueChange = (currentTime) => {
        this.videoRef.seek(currentTime);
        if (this.state.isPaused) {
            this.setState({
                isPaused: false,
                isShowVideoCover: false
            })
        }
    };

    // 点击展开全屏或收起全屏
    _onTapSwitchButton = () => {
        if (this.state.isFullScreen) {
            Orientation.lockToPortrait();
        } else {
            Orientation.lockToLandscape();
            // Orientation.lockToLandscapeRight();
            // Orientation.lockToLandscapeLeft();
        }
    };

    // 显示切换清晰度的界面
    _onTapDefinitionButton = () => {
        this.setState({
            isDefinitionShow: true,
            isShowControl: false
        })
    };

    // 显示选集界面
    _onTapSelectVideo = () => {
        this.setState({
            isVideoListShow: true,
            isShowControl: false
        })
    };

    // 点击截屏
    _onTapCaptureImage = () => {

    };

    // 点击AirPlay
    _onTapAirplayButton = () => {

    };

    // 显示分享界面
    _onTapShareButton = () => {
        this.setState({
            isShareMenuShow: true,
            isShowControl: false
        })
    };

    // 显示更多设置界面
    _onTapMoreButton = () => {
        this.setState({
            isSettingViewShow: true,
            isShowControl: false
        })
    };

    onDefinitionItemSelected(index) {
        this.setState({
            isDefinitionShow: false,
            isShowControl: true,
            definitionIndex: index,
        })
    };

    onVideoListSwitch(url) {
        this.updateVideo(url, 0, null);
        this.setState({
            isVideoListShow: false
        })
    };

    onShareMenuPressed(index) {
        this.setState({
            isShareMenuShow: false
        })
    };

    onMuteVolume(isMute) {
        let volume = this.state.volume;
        if (!isMute && volume === 0) {
            volume = 1.0;
        }
        this.setState({
            isMuted: isMute,
            volume: volume,
            isSettingViewShow: false
        })
    };

    onPlayRateChange(rate) {
        this.setState({
            playRate: rate,
            isSettingViewShow: false
        })
    };

    onEndTimeChange(index) {

    };

    onVolumeChanged(volume) {
        let isMute = (volume === 0);
        this.setState({
            volume: volume,
            isMuted: isMute
        })
    };

    /// --------外部调用方法--------
    // 切换视频地址
    updateVideo(videoUrl, seekTime, videoTitle) {
        let title = (videoTitle != null) ? videoTitle : this.state.videoTitle;
        this.setState({
            videoUrl: videoUrl,
            videoTitle: title,
            isPaused: false,
            isShowVideoCover: false,
        });
        this.videoRef.seek(seekTime);
    };

    // 切换是否全屏时更改video的宽高布局
    updateLayout(width, height, isFullScreen) {
        let xPadding = 0;
        if (isFullScreen) {
            // 全屏模式下iPhone X左右两边需要留出状态栏的部分，避免视频被刘海遮住
            xPadding = isIPhoneX ? statusBarHeight : 0;
        }
        this.setState({
            x: xPadding,
            videoWidth: width,
            videoHeight: height,
            isFullScreen: isFullScreen
        })
    };

}

export function formatTime(second) {
    let h = 0, i = 0, s = parseInt(second);
    if (s > 60) {
        i = parseInt(s / 60);
        s = parseInt(s % 60);
    }
    // 补零
    let zero = function (v) {
        return (v >> 0) < 10 ? "0" + v : v;
    };
    return [zero(h), zero(i), zero(s)].join(":");
};
export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;
export const defaultVideoHeight = screenWidth * 9 / 16;
export const isIPhoneX = DeviceInfo.isIPhoneX_deprecated;
export const statusBarHeight = isIPhoneX ? 44 : 20;
export const isSystemIOS = (Platform.OS === 'ios');

const styles = StyleSheet.create({
    playButton: {
        position: 'absolute',
        width: 50,
        height: 50,
    },
    bottomControl: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 13,
        color: '#fff',
        marginHorizontal: 10,
    },
    videoTitle: {
        fontSize: 14,
        color: 'white',
        flex: 1,
        marginRight: 15,
    },
    control_play_btn: {
        width: 24,
        height: 24,
    },
    control_switch_btn: {
        width: 15,
        height: 15,
    },
    topControl: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        flexDirection: 'row',
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 15,
    },
    bottomOptionView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        height: 50,
    },
    bottomOptionItem: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 10,
    },
    bottomOptionText: {
        fontSize: 14,
        color: 'white',
    },
    topOptionView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        height: 50,
    },
    topOptionItem: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topImageOption: {
        width: 24,
        height: 24,
    },
});
