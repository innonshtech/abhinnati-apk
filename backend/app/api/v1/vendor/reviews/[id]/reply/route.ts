import { NextRequest } from 'next/server';
import { VendorController } from '../../../../../../../../src/presentation/controllers/vendor.controller';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) { return VendorController.postReviewReply(req, { params }); }