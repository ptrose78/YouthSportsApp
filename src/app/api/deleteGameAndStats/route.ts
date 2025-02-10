
import { deleteGame } from '@/app/lib/data';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const { game_id } = await request.json();
  const result = await deleteGame(game_id);
  return NextResponse.json(result);
}

