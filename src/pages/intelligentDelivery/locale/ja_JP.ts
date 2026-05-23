const ja_JP = {
  title: 'インテリジェントデリバリー',
  subtitle: 'パイプライン編成、成果物再利用、ドキュメント解析、テスト統制を一つのデリバリーワークスペースにまとめます。',
  status: '企画中',
  sections: {
    pipelines: {
      desc: 'ビルド、デプロイ、ロールバック、承認ステージを見える形で編成します。',
    },
    artifacts: {
      desc: '成果物をバージョン、来歴、再利用可能な配布チャネルとともに管理します。',
    },
    knowledge: {
      desc: 'デプロイ文書とデプロイビューを解析し、パイプライン下書き、CMDB 資産、サービス接続候補を生成します。',
    },
    tests: {
      desc: 'リリース前のテスト計画、結果、品質ゲートをまとめて管理します。',
    },
  },
  modules: {
    pipelines: {
      title: 'パイプライン',
      eyebrow: 'オーケストレーション',
      desc: 'ビルド、承認、配信、ロールバックを再利用可能なフローにまとめます。',
    },
    artifacts: {
      title: '成果物リポジトリ',
      eyebrow: 'アセットハブ',
      desc: 'インストールパッケージやリリース成果物を保管し、繰り返し配布できるようにします。',
    },
    knowledge: {
      title: 'ドキュメント解析',
      eyebrow: 'Docs to templates',
      desc: '従来のデプロイ文書をパイプライン下書きに変換し、CMDB とサービス接続候補を抽出します。',
    },
    tests: {
      title: 'テスト管理',
      eyebrow: '品質ゲート',
      desc: 'テスト計画、ケース、結果、リリース前チェックを一箇所で追跡します。',
    },
  },
  cards: {
    blueprint: '初期におすすめの能力',
    object: '自然な連携対象',
    rhythm: '推奨される運用リズム',
  },
  values: {
    pipelines_blueprint: 'リリーステンプレート、環境昇格、手動承認、ロールバック',
    artifacts_blueprint: 'パッケージ保管、メタデータ登録、保持ポリシー、ダウンロード追跡',
    knowledge_blueprint: 'デプロイ文書解析、手順抽出、変数マッピング、下書きインポート',
    tests_blueprint: 'リリースチェックリスト、スモークテスト、回帰テスト、品質スコアカード',
    pipelines_object: 'ホスト、ビジネスグループ、Agent パッケージ、収集設定',
    artifacts_object: 'バージョン付きバンドル、配布チャネル、環境ラベル',
    knowledge_object: 'パイプラインテンプレート、CMDB、サービス接続、成果物',
    tests_object: 'パイプライン、リリース、環境、変更申請',
    pipelines_rhythm: '変更単位 / リリース単位',
    artifacts_rhythm: '継続的な蓄積',
    knowledge_rhythm: '新規プロジェクト納品またはデプロイビュー変更時',
    tests_rhythm: 'リリース前とロールバック後',
  },
};

export default ja_JP;
