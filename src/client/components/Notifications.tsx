import { notification } from 'antd';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getNotificationsToDisplay } from '../store/selectors';
import { useStoreDispatch } from '../store/store';
import { ActionType, MarkNotificationDisplayed } from '../store/types';

const Notifications = () => {
    const dispatch = useStoreDispatch();
    const newNotifications = useSelector(getNotificationsToDisplay);
    useEffect(() => {
        const notificationToDisplay = newNotifications.shift();
        if (notificationToDisplay) {
            notification[notificationToDisplay.type]({
                message: notificationToDisplay.title,
                description: notificationToDisplay.description,
                duration: 3,
            });
            dispatch({
                type: ActionType.NOTIFICATION_DISPLAYED,
                id: notificationToDisplay.id
            } as MarkNotificationDisplayed);
        }
    }, [newNotifications])
    return null;
}

export default Notifications;