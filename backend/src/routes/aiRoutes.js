import express from 'express';
import { chat } from '../controllers/aiController.js';

const router = express.Router();

// AI assistant chat (triage + facility suggestions)
router.post('/chat', chat);

export default router;