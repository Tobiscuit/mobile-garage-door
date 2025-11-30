export interface Door {
    id: string;
    manufacturer: string;
    model: string;
    style: string;
    material: string;
    r_value: number;
    image_url: string;
    embedding: number[];
}

export const doors: Door[] = [
    {
        id: 'amarr-classica-3000',
        manufacturer: 'Amarr',
        model: 'Classica 3000',
        style: 'Carriage House',
        material: 'Steel',
        r_value: 13.35,
        image_url: 'https://assets.amarr.com/classica-3000.jpg',
        embedding: [0.023, -0.12, 0.05, 0.88] // Simplified embedding
    },
    {
        id: 'clopay-canyon-ridge',
        manufacturer: 'Clopay',
        model: 'Canyon Ridge',
        style: 'Faux Wood',
        material: 'Composite',
        r_value: 20.4,
        image_url: 'https://assets.clopay.com/canyon-ridge.jpg',
        embedding: [0.050, -0.08, 0.12, 0.75]
    },
    {
        id: 'waynedalton-9700',
        manufacturer: 'Wayne Dalton',
        model: 'Model 9700',
        style: 'Carriage House',
        material: 'Steel',
        r_value: 10.0,
        image_url: 'https://assets.waynedalton.com/9700.jpg',
        embedding: [0.015, -0.10, 0.08, 0.80]
    }
];
