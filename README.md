# Card Race Game

Dört asın kendi sembol şeritlerinde yarıştığı, iskambil destesiyle çalışan metin tabanlı bir Python oyunu.

Her turda desteden rastgele bir kart çekilir ve aynı sembole sahip as bir adım ilerler. Bütün aslar başlangıç çizgisini geçtiğinde yan şeritteki kart açılır; açılan kartın sembolü ilgili ası geri gönderir. Kendi şeridinin sonuna doğru kartı çeken ilk as yarışı kazanır.

## Özellikler

- Nesne yönelimli kart, deste, oyun tahtası ve dağıtıcı yapısı
- Dört bağımsız sembol şeridi
- Rastgele kart çekimi ve ceza kartı mekaniği
- Terminal/Colab üzerinde yenilenen metin tabanlı oyun tahtası
- Hem Python betiği hem de özgün Colab defteri

## Çalıştırma

```bash
python -m pip install -r requirements.txt
python card_race_game.py
```

Colab sürümü: [Card Race Game](https://colab.research.google.com/drive/1aAZN6_8QMpRF14nnn7GuxYBTzFvBOi5E?usp=sharing)
