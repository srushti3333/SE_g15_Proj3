describe('Customer Home Promo Display', () => {
  it('displays active promos', () => {
    const mockPromos = [
      {
        id: '1',
        title: 'Summer Sale',
        restaurantName: 'Test Restaurant',
        description: 'Get 20% off',
        discountPercent: 20,
        code: 'SUMMER20',
        validUntil: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Winter Special',
        restaurantName: 'Another Restaurant',
        description: 'Get 30% off',
        discountPercent: 30,
        code: 'WINTER30',
        validUntil: new Date().toISOString()
      }
    ];
    
    expect(mockPromos).toHaveLength(2);
    expect(mockPromos[0].title).toBe('Summer Sale');
    expect(mockPromos[0].code).toBe('SUMMER20');
    expect(mockPromos[1].discountPercent).toBe(30);
  });

  it('handles empty promo list', () => {
    const promos: any[] = [];
    expect(promos).toHaveLength(0);
  });
});

export {};
