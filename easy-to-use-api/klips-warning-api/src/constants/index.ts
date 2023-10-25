import { NotificationInput } from "../types";

export const notificationOptions: NotificationInput[] = [
    {
        name: 'blue',
        color: '#132e5f',
        notification: 'Kältewarnung',
        text: 'Niedrige Temperaturen werden erwartet.',
    },
    {
        name: 'green',
        color: '#0a3b21',
        notification: 'Keine Warnung',
        text: 'Es werden keine Temperaturextreme erwartet',
    },
    {
        name: 'orange',
        color: '#E55F25',
        notification: 'Hitzewarnung',
        text: 'Es werden hohe Temperaturen erwartet',
    },
    {
        name: 'red',
        color: '#ba0000',
        notification: 'Hitzewarnug',
        text: 'Es werden sehr hohe Temperaturen erwartet',
    },

];
