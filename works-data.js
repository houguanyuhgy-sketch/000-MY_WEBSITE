// 作品数据 - 数据驱动方式管理作品信息
// 添加新作品只需在此数组中添加新对象即可

const worksData = [
    {
        id: 1,
        title: '《FLOW-001》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-001》699233.png',
        seed: '699233',
        description: '这是作品1的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 2,
        title: '《FLOW-002》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-002》87809.png',
        seed: '87809',
        description: '这是作品2的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 3,
        title: '《FLOW-003》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-003》114952.png',
        seed: '114952',
        description: '这是作品3的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 4,
        title: '《FLOW-004》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-004》633007.png',
        seed: '633007',
        description: '这是作品4的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 5,
        title: '《FLOW-005》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-005》303658.png',
        seed: '303658',
        description: '这是作品5的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 6,
        title: '《FLOW-006》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-006》350305.png',
        seed: '350305',
        description: '这是作品6的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 7,
        title: '《FLOW-007》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-007》327274.png',
        seed: '327274',
        description: '这是作品7的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 8,
        title: '《FLOW-008》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-008》585928.png',
        seed: '585928',
        description: '这是作品8的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 9,
        title: '《FLOW-009》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-009》761660.png',
        seed: '761660',
        description: '这是作品9的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 10,
        title: '《FLOW-010》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-010》58890.png',
        seed: '58890',
        description: '这是作品10的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 11,
        title: '《FLOW-011》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-011》73106.png',
        seed: '73106',
        description: '这是作品11的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 12,
        title: '《FLOW-012》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-012》380624.png',
        seed: '380624',
        description: '这是作品12的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 13,
        title: '《FLOW-013》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-013》174713.png',
        seed: '174713',
        description: '这是作品13的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 14,
        title: '《FLOW-014》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-014》894878.png',
        seed: '894878',
        description: '这是作品14的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 15,
        title: '《FLOW-015》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-015》936432.png',
        seed: '936432',
        description: '这是作品15的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 16,
        title: '《FLOW-016》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-016》90158.png',
        seed: '90158',
        description: '这是作品16的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 17,
        title: '《FLOW-017》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-017》828356.png',
        seed: '828356',
        description: '这是作品17的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    },
    {
        id: 18,
        title: '《FLOW-018》',
        size: '594 × 841 mm',
        imagePath: 'images/《FLOW-018》215636.png',
        seed: '215636',
        description: '这是作品18的详细描述。您可以在这里添加关于作品的创作理念、技术细节、创作时间等信息。'
    }
];

