const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get all tasks
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Task.countDocuments({ user: req.user.userId });
        const totalPages = Math.ceil(total / limit);

        res.json({
            tasks,
            currentPage: page,
            totalPages,
            totalTasks: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, priority, deadline } = req.body;
        
        const task = new Task({
            title,
            description,
            priority,
            deadline,
            user: req.user.userId
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task
router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        Object.assign(task, req.body);
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;