from app import create_app

app = create_app()
with app.test_client() as c:
    r = c.get('/static/css/base.css')
    print('status', r.status_code)
    print('content-type:', r.headers.get('Content-Type'))
    print('size:', len(r.get_data()))
    print('\n---preview---\n')
    print(r.get_data()[:200].decode('utf-8', errors='replace'))
