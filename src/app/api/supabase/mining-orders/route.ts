import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ success: false, error: 'Address is required' }, { status: 400 });
    }

    // 模拟数据
    const mockData = [
      {
        pool_id: 1,
        amount: '1000.00',
        earnings: '50.00',
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({ success: true, data: mockData });
  } catch (error) {
    console.error('Error fetching mining orders:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

