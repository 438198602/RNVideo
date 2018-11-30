/**
 * 视频清晰度切换
 */
import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

export default class SelectDefinitionView extends React.Component {
    static defaultProps = {
        selectedIndex: 0
    };

    static propTypes = {
        onItemSelected: PropTypes.func,
        onCloseWindow: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: this.props.selectedIndex
        }
    }

    render() {
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={[styles.container, this.props.style]}
                onPress={this._onTapBackground}
            >
                <View style={styles.optionView}>
                    {
                        this.props.data.map((item, index) => {
                            let isSelected = (this.state.selectedIndex === index);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.7}
                                    style={[styles.optionItem, isSelected ? styles.optionItem_active : null]}
                                    onPress={() => { this.onTapItemAtIndex(index); }}
                                >
                                    <Text style={[styles.optionText, isSelected ? styles.optionText_active : null]}>{item}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            </TouchableOpacity>
        );
    }

    _onTapBackground = () => {
        this.props.onCloseWindow && this.props.onCloseWindow();
    };

    onTapItemAtIndex(index) {
        if (this.state.selectedIndex !== index) {
            this.setState({
                selectedIndex: index
            })
        }
        this.props.onItemSelected && this.props.onItemSelected(index);
    };
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionView: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionItem: {
        marginTop: 10,
        marginBottom: 10,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15,
    },
    optionItem_active: {
        borderWidth: 1,
        borderColor: '#ff5500',
        borderRadius: 20,
        backgroundColor: '#222',
    },
    optionText: {
        fontSize: 15,
        color: 'white',
    },
    optionText_active: {
        color: '#ff5500',
    },
});
