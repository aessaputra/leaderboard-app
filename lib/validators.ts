import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const TrophySchema = z.object({
  userId: z.string().min(1),
  competition: z.enum(['UCL', 'EUROPA']),
  season: z.string().min(3).optional(),
});

export const LeaderboardQuerySchema = z.object({
  competition: z.enum(['UCL', 'EUROPA']).optional(),
  season: z.string().optional(),
});
