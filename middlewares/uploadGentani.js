export const validateHeaders = (req, res, next) => {
    const requiredHeaders = [
        'material_no',
        'plant',
        'quantity_fortuner',
        'quantity_zenix',
        'quantity_innova',
        'quantity_avanza',
        'quantity_yaris',
        'quantity_calya',
    ];

    // Check if 'data' is provided and is an array
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "Invalid or missing data array!" });
    }

    // Validate headers
    const headers = Object.keys(data[0]);
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
        return res.status(400).json({
            message: `Invalid file! Missing required columns: ${missingHeaders.join(', ')}`,
        });
    }

    next(); // Pass control to the next middleware
};
