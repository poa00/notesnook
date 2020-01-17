import React, {Component} from 'react';
import {DeviceEventEmitter} from 'react-native';
import {ActionSheetComponent} from '../ActionSheetComponent';
import ActionSheet from '../ActionSheet';
import {Dialog} from '../Dialog';
import {VaultDialog} from '../VaultDialog';
export const ActionSheetEvent = (item, colors, tags, rowItems, columnItems) => {
  DeviceEventEmitter.emit('ActionSheetEvent', {
    item,
    colors,
    tags,
    rowItems,
    columnItems,
  });
};
export const ActionSheetHideEvent = () => {
  DeviceEventEmitter.emit('ActionSheetHideEvent');
};

export const simpleDialogEvent = data => {
  DeviceEventEmitter.emit('simpleDialogEvent', data);
};

export const simpleDialogHideEvent = () => {
  DeviceEventEmitter.emit('simpleDialogHideEvent');
};

export const updateEvent = data => {
  DeviceEventEmitter.emit('updateEvent', data);
};

export const _recieveEvent = (eventName, action) => {
  DeviceEventEmitter.addListener(eventName, action);
};

export const _unSubscribeEvent = (eventName, action) => {
  DeviceEventEmitter.removeListener(eventName, action);
};

export const TEMPLATE_DELETE = type => {
  return {
    title: `Delete ${type}`,
    paragraph: `Are you sure you want to delete this ${type}`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    action: dialogActions.ACTION_DELETE,
    icon: 'trash',
  };
};

export const dialogActions = {
  ACTION_DELETE: 511,
  ACTION_EXIT: 512,
};

export class DialogManager extends Component {
  constructor(props) {
    super(props);
    this.actionSheet;
    this.opened = false;

    this.state = {
      item: {},
      actionSheetData: {
        colors: false,
        tags: false,
        rowItems: [],
        columnItems: [],
      },
      simpleDialog: {
        title: '',
        paragraph: '',
        positiveText: '',
        negativeText: '',
        action: 0,
        icon: '',
      },
      isPerm: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) ||
      nextState !== this.state
    );
  }

  _showActionSheet = data => {
    this.setState(
      {
        actionSheetData: data,
        item: data.item,
      },
      () => {
        this.actionSheet._setModalVisible();
      },
    );
  };

  _hideActionSheet = () => {
    this.actionSheet._setModalVisible();
  };

  componentDidMount() {
    _recieveEvent('ActionSheetEvent', this._showActionSheet);
    _recieveEvent('ActionSheetHideEvent', this._hideActionSheet);

    _recieveEvent('simpleDialogEvent', this._showSimpleDialog);
    _recieveEvent('simpleDialogHideEvent', this._hideActionSheet);
  }
  componentWillUnmount() {
    _unSubscribeEvent('ActionSheetEvent', this._showActionSheet);
    _unSubscribeEvent('ActionSheetHideEvent', this._hideSimpleDialog);

    _unSubscribeEvent('simpleDialogEvent', this._showSimpleDialog);
    _unSubscribeEvent('simpleDialogHideEvent', this._hideSimpleDialog);
  }

  _showSimpleDialog = data => {
    this.setState(
      {
        simpleDialog: data,
      },
      () => {
        this.simpleDialog.show();
      },
    );
  };
  _hideSimpleDialog = data => {
    this.simpleDialog.hide();
  };

  _showVaultDialog = () => {
    this.vaultDialogRef.open();
  };
  _hideVaultDialog = () => {
    this.vaultDialogRef.close();
  };

  onActionSheetHide = () => {
    if (this.show) {
      if (this.show === 'delete') {
        this._showSimpleDialog(TEMPLATE_DELETE(this.state.item.type));

        this.show = null;
      } else if (this.show == 'lock') {
        this._showVaultDialog();
        this.show = null;
      } else if (this.show == 'unlock') {
        this.setState({
          isPerm: true,
        });
        this._showVaultDialog();
        this.show = null;
      }
    }
    this.show = null;
  };

  render() {
    let {colors} = this.props;
    let {
      actionSheetData,
      item,
      simpleDialog,
      isPerm,
      vaultDialog,
      unlock,
    } = this.state;
    return (
      <>
        <ActionSheet
          ref={ref => (this.actionSheet = ref)}
          customStyles={{
            backgroundColor: colors.bg,
          }}
          indicatorColor={colors.shade}
          initialOffsetFromBottom={0.5}
          bounceOnOpen={true}
          gestureEnabled={true}
          onClose={() => {
            this.onActionSheetHide();
          }}>
          <ActionSheetComponent
            item={item}
            setWillRefresh={value => {
              this.willRefresh = true;
            }}
            hasColors={actionSheetData.colors}
            hasTags={actionSheetData.colors}
            overlayColor={
              colors.night ? 'rgba(225,225,225,0.1)' : 'rgba(0,0,0,0.3)'
            }
            rowItems={actionSheetData.rowItems}
            columnItems={actionSheetData.columnItems}
            close={value => {
              if (value) {
                this.show = value;
              }
              this.actionSheet._setModalVisible();
            }}
          />
        </ActionSheet>

        <Dialog
          ref={ref => (this.simpleDialog = ref)}
          item={item}
          colors={colors}
          template={simpleDialog}
        />

        <VaultDialog
          ref={ref => (this.vaultDialogRef = ref)}
          colors={colors}
          note={item}
          perm={isPerm}
          openedToUnlock={false}
          visible={vaultDialog}
        />
      </>
    );
  }
}
