import requests
import time
import json

def run_test():
    auth_url = 'http://localhost:5000/api/auth/register'
    user_payload = {
        'name': 'Test User',
        'email': f'test_{int(time.time())}@example.com',
        'password': 'password123'
    }
    r_auth = requests.post(auth_url, json=user_payload)
    token = r_auth.json().get('token')
    print('Auth Token acquired:', bool(token))

    headers = {'Authorization': f'Bearer {token}'}
    create_url = 'http://localhost:5000/api/lectures/create-from-youtube'
    payload = {
        'youtubeUrl': 'https://youtu.be/8Ja8RQyvovA',
        'title': 'Test DBMS Lecture',
        'notesStyle': 'detailed',
        'inkStyle': 'royal_blue'
    }
    t0 = time.time()
    r_create = requests.post(create_url, json=payload, headers=headers)
    print('Create lecture response:', r_create.status_code, r_create.json())
    lec_id = r_create.json().get('lecture', {}).get('_id')
    print('Lecture ID:', lec_id)

    status_url = f'http://localhost:5000/api/lectures/{lec_id}/status'
    for i in range(40):
        time.sleep(3)
        try:
            r_stat = requests.get(status_url, headers=headers)
            data = r_stat.json()
            lec = data.get('lecture', {})
            note = data.get('note')
            st = lec.get('status')
            prog = lec.get('progress')
            print(f'[{i*3}s] Status: {st}, Progress: {prog}, Note: {bool(note)}')
            if st == 'completed':
                print(f'SUCCESS! Completed in {time.time()-t0:.2f}s!')
                print('Note ID:', note.get('_id') if note else None)
                print('Pages:', len(note.get('pages', [])) if note else 0)
                break
            if st == 'failed':
                print('PIPELINE REPORTED FAILED!')
                break
        except Exception as e:
            print(f'Error polling: {e}')

if __name__ == '__main__':
    run_test()
